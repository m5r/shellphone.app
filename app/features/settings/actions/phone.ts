import { type ActionFunction, type Session, json } from "@remix-run/node";
import { badRequest } from "remix-utils";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import db from "~/utils/db.server";
import { type FormActionData, validate } from "~/utils/validation.server";
import { refreshSessionData, requireLoggedIn } from "~/utils/auth.server";
import { commitSession } from "~/utils/session.server";
import setTwilioWebhooksQueue from "~/queues/set-twilio-webhooks.server";
import logger from "~/utils/logger.server";
import { encrypt } from "~/utils/encryption";
import getTwilioClient from "~/utils/twilio.server";
import fetchPhoneCallsQueue from "~/queues/fetch-phone-calls.server";
import fetchMessagesQueue from "~/queues/fetch-messages.server";
import setTwilioApiKeyQueue from "~/queues/set-twilio-api-key.server";

const action: ActionFunction = async ({ request }) => {
	const formData = Object.fromEntries(await request.formData());
	if (!formData._action) {
		const errorMessage = "POST /settings/phone without any _action";
		logger.error(errorMessage);
		return badRequest({ errorMessage });
	}

	switch (formData._action as Action) {
		case "setPhoneNumber":
			return setPhoneNumber(request, formData);
		case "setTwilioCredentials":
			return setTwilioCredentials(request, formData);
		case "refreshPhoneNumbers":
			return refreshPhoneNumbers(request);
		default:
			const errorMessage = `POST /settings/phone with an invalid _action=${formData._action}`;
			logger.error(errorMessage);
			return badRequest({ errorMessage });
	}
};

export type SetPhoneNumberActionData = FormActionData<typeof validations, "setPhoneNumber">;

async function setPhoneNumber(request: Request, formData: unknown) {
	const { organization, twilio } = await requireLoggedIn(request);
	if (!twilio) {
		return badRequest<SetPhoneNumberActionData>({
			setPhoneNumber: {
				errors: { general: "Connect your Twilio account first" },
			},
		});
	}

	const validation = validate(validations.setPhoneNumber, formData);
	if (validation.errors) {
		return badRequest<SetPhoneNumberActionData>({ setPhoneNumber: { errors: validation.errors } });
	}

	try {
		await db.phoneNumber.update({
			where: { twilioAccountSid_isCurrent: { twilioAccountSid: twilio.accountSid, isCurrent: true } },
			data: { isCurrent: false },
		});
	} catch (error: any) {
		if (error.code !== "P2025") {
			// if any error other than record not found
			throw error;
		}
	}

	await db.phoneNumber.update({
		where: { id: validation.data.phoneNumberSid },
		data: { isCurrent: true },
	});
	await setTwilioWebhooksQueue.add(`set twilio webhooks for phoneNumberId=${validation.data.phoneNumberSid}`, {
		phoneNumberId: validation.data.phoneNumberSid,
		organizationId: organization.id,
	});

	return json<SetPhoneNumberActionData>({ setPhoneNumber: { submitted: true } });
}

export type SetTwilioCredentialsActionData = FormActionData<typeof validations, "setTwilioCredentials">;

async function setTwilioCredentials(request: Request, formData: unknown) {
	const { organization, twilio } = await requireLoggedIn(request);
	const validation = validate(validations.setTwilioCredentials, formData);
	if (validation.errors) {
		return badRequest<SetTwilioCredentialsActionData>({ setTwilioCredentials: { errors: validation.errors } });
	}

	const { twilioAccountSid, twilioAuthToken } = validation.data;
	const authToken = encrypt(twilioAuthToken);
	const twilioClient = getTwilioClient({ accountSid: twilioAccountSid, authToken });
	try {
		await twilioClient.api.accounts(twilioAccountSid).fetch();
	} catch (error: any) {
		logger.error(error);

		if (error.status !== 401) {
			throw error;
		}

		let session: Session | undefined;
		if (twilio) {
			await db.twilioAccount.delete({ where: { accountSid: twilio?.accountSid } });
			session = (await refreshSessionData(request)).session;
		}

		return json<SetTwilioCredentialsActionData>(
			{
				setTwilioCredentials: {
					errors: { general: "Invalid Account SID or Auth Token" },
				},
			},
			{
				headers: session
					? {
							"Set-Cookie": await commitSession(session),
					  }
					: {},
			},
		);
	}

	const data: Pick<Prisma.TwilioAccountUpsertArgs["create"], "accountSid" | "authToken"> = {
		accountSid: twilioAccountSid,
		authToken,
	};
	const [phoneNumbers] = await Promise.all([
		twilioClient.incomingPhoneNumbers.list(),
		db.twilioAccount.upsert({
			where: { organizationId: organization.id },
			create: {
				organization: {
					connect: { id: organization.id },
				},
				...data,
			},
			update: data,
		}),
	]);

	setTwilioApiKeyQueue.add(`set twilio api key for accountSid=${twilioAccountSid}`, {
		accountSid: twilioAccountSid,
	});
	await Promise.all(
		phoneNumbers.map(async (phoneNumber) => {
			const phoneNumberId = phoneNumber.sid;
			logger.info(`Importing phone number with id=${phoneNumberId}`);
			try {
				await db.phoneNumber.create({
					data: {
						id: phoneNumberId,
						twilioAccountSid,
						number: phoneNumber.phoneNumber,
						isCurrent: false,
						isFetchingCalls: true,
						isFetchingMessages: true,
					},
				});

				await Promise.all([
					fetchPhoneCallsQueue.add(`fetch calls of id=${phoneNumberId}`, {
						phoneNumberId,
					}),
					fetchMessagesQueue.add(`fetch messages of id=${phoneNumberId}`, {
						phoneNumberId,
					}),
				]);
			} catch (error: any) {
				logger.error(error);

				if (error.code !== "P2002") {
					// if it's not a duplicate, it's a real error we need to handle
					throw error;
				}
			}
		}),
	);

	const { session } = await refreshSessionData(request);
	return json<SetTwilioCredentialsActionData>(
		{ setTwilioCredentials: { submitted: true } },
		{
			headers: {
				"Set-Cookie": await commitSession(session),
			},
		},
	);
}

async function refreshPhoneNumbers(request: Request) {
	const { twilio } = await requireLoggedIn(request);
	if (!twilio) {
		throw new Error("unreachable");
	}
	const twilioAccount = await db.twilioAccount.findUnique({ where: { accountSid: twilio.accountSid } });
	if (!twilioAccount) {
		throw new Error("unreachable");
	}

	const twilioClient = getTwilioClient(twilioAccount);
	const phoneNumbers = await twilioClient.incomingPhoneNumbers.list();
	await Promise.all(
		phoneNumbers.map(async (phoneNumber) => {
			const phoneNumberId = phoneNumber.sid;
			try {
				await db.phoneNumber.create({
					data: {
						id: phoneNumberId,
						twilioAccountSid: twilioAccount.accountSid,
						number: phoneNumber.phoneNumber,
						isCurrent: false,
						isFetchingCalls: true,
						isFetchingMessages: true,
					},
				});
			} catch (error: any) {
				if (error.code !== "P2002") {
					// if it's not a duplicate, it's a real error we need to handle
					throw error;
				}
			}

			await Promise.all([
				fetchPhoneCallsQueue.add(`fetch calls of id=${phoneNumberId}`, {
					phoneNumberId,
				}),
				fetchMessagesQueue.add(`fetch messages of id=${phoneNumberId}`, {
					phoneNumberId,
				}),
			]);
		}),
	);

	return null;
}

export default action;

type Action = "setPhoneNumber" | "setTwilioCredentials" | "refreshPhoneNumbers";

const validations = {
	setPhoneNumber: z.object({
		phoneNumberSid: z
			.string()
			.refine((phoneNumberSid) => phoneNumberSid.startsWith("PN"), "Select a valid phone number"),
	}),
	setTwilioCredentials: z.object({
		twilioAccountSid: z.string(),
		twilioAuthToken: z.string(),
	}),
} as const;
