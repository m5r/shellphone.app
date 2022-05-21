import { type ActionFunction, json } from "@remix-run/node";
import { badRequest } from "remix-utils";
import { z } from "zod";

import db from "~/utils/db.server";
import { type FormError, validate } from "~/utils/validation.server";
import { refreshSessionData, requireLoggedIn } from "~/utils/auth.server";
import { commitSession } from "~/utils/session.server";
import setTwilioWebhooksQueue from "~/queues/set-twilio-webhooks.server";

type SetPhoneNumberFailureActionData = { errors: FormError<typeof bodySchema>; submitted?: never };
type SetPhoneNumberSuccessfulActionData = { errors?: never; submitted: true };
export type SetPhoneNumberActionData = SetPhoneNumberFailureActionData | SetPhoneNumberSuccessfulActionData;

const action: ActionFunction = async ({ request }) => {
	const { organization } = await requireLoggedIn(request);
	const formData = Object.fromEntries(await request.formData());
	const validation = validate(bodySchema, formData);
	if (validation.errors) {
		return badRequest<SetPhoneNumberActionData>({ errors: validation.errors });
	}

	try {
		await db.phoneNumber.update({
			where: { organizationId_isCurrent: { organizationId: organization.id, isCurrent: true } },
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
	const { session } = await refreshSessionData(request);

	return json<SetPhoneNumberActionData>(
		{ submitted: true },
		{
			headers: {
				"Set-Cookie": await commitSession(session),
			},
		},
	);
};

export default action;

const bodySchema = z.object({
	phoneNumberSid: z
		.string()
		.refine((phoneNumberSid) => phoneNumberSid.startsWith("PN"), "Select a valid phone number"),
});
