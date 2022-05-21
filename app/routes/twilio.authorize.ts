import { type LoaderFunction, redirect } from "@remix-run/node";
import twilio from "twilio";

import { refreshSessionData, requireLoggedIn } from "~/utils/auth.server";
import { commitSession } from "~/utils/session.server";
import db from "~/utils/db.server";
import serverConfig from "~/config/config.server";
import getTwilioClient from "~/utils/twilio.server";
import fetchPhoneCallsQueue from "~/queues/fetch-phone-calls.server";
import fetchMessagesQueue from "~/queues/fetch-messages.server";
import { encrypt } from "~/utils/encryption";

export const loader: LoaderFunction = async ({ request }) => {
	const { organization } = await requireLoggedIn(request);
	const url = new URL(request.url);
	const twilioSubAccountSid = url.searchParams.get("AccountSid");
	if (!twilioSubAccountSid) {
		throw new Error("unreachable");
	}

	let twilioClient = twilio(twilioSubAccountSid, serverConfig.twilio.authToken);
	const twilioSubAccount = await twilioClient.api.accounts(twilioSubAccountSid).fetch();
	const twilioMainAccountSid = twilioSubAccount.ownerAccountSid;
	const twilioMainAccount = await twilioClient.api.accounts(twilioMainAccountSid).fetch();
	console.log("twilioSubAccount", twilioSubAccount);
	console.log("twilioAccount", twilioMainAccount);
	const twilioAccount = await db.twilioAccount.upsert({
		where: { organizationId: organization.id },
		create: {
			organization: {
				connect: { id: organization.id },
			},
			subAccountSid: twilioSubAccount.sid,
			subAccountAuthToken: encrypt(twilioSubAccount.authToken),
			accountSid: twilioMainAccount.sid,
			accountAuthToken: encrypt(twilioMainAccount.authToken),
		},
		update: {
			subAccountSid: twilioSubAccount.sid,
			subAccountAuthToken: encrypt(twilioSubAccount.authToken),
			accountSid: twilioMainAccount.sid,
			accountAuthToken: encrypt(twilioMainAccount.authToken),
		},
	});

	twilioClient = getTwilioClient(twilioAccount);
	const phoneNumbers = await twilioClient.incomingPhoneNumbers.list();
	await Promise.all(
		phoneNumbers.map(async (phoneNumber) => {
			const phoneNumberId = phoneNumber.sid;
			try {
				await db.phoneNumber.create({
					data: {
						id: phoneNumberId,
						organizationId: organization.id,
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
				if (error.code !== "P2002") {
					// if it's not a duplicate, it's a real error we need to handle
					throw error;
				}
			}
		}),
	);

	const { session } = await refreshSessionData(request);
	return redirect("/settings/phone", {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
};
