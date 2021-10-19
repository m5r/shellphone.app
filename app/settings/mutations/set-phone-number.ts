import { resolver } from "blitz";
import { z } from "zod";
import twilio from "twilio";
import RestException from "twilio/lib/base/RestException";

import db from "db";
import getCurrentUser from "app/users/queries/get-current-user";
import setTwilioWebhooks from "../api/queue/set-twilio-webhooks";
import fetchMessagesQueue from "../../messages/api/queue/fetch-messages";
import fetchCallsQueue from "../../phone-calls/api/queue/fetch-calls";

const Body = z.object({
	phoneNumberSid: z.string(),
});

export default resolver.pipe(resolver.zod(Body), resolver.authorize(), async ({ phoneNumberSid }, context) => {
	const user = await getCurrentUser(null, context);
	const organization = user?.memberships[0]!.organization;
	if (!user || !organization || !organization.twilioAccountSid || !organization.twilioAuthToken) {
		return;
	}

	const phoneNumbers = await twilio(
		organization.twilioAccountSid,
		organization.twilioAuthToken,
	).incomingPhoneNumbers.list();
	const phoneNumber = phoneNumbers.find((phoneNumber) => phoneNumber.sid === phoneNumberSid)!;
	const organizationId = organization.id;
	await db.phoneNumber.create({
		data: {
			organizationId,
			id: phoneNumberSid,
			number: phoneNumber.phoneNumber,
		},
	});

	let newApiKey;
	const mainTwilioClient = twilio(organization.twilioAccountSid, organization.twilioAuthToken);
	if (!organization.twilioApiKey) {
		newApiKey = await mainTwilioClient.newKeys.create({ friendlyName: "Shellphone API key" });
	} else {
		try {
			await mainTwilioClient.keys.get(organization.twilioApiKey);
		} catch (error) {
			if (!(error instanceof RestException) || error.code !== 20404) {
				throw error;
			}

			// API key was not found, create a new one
			newApiKey = await mainTwilioClient.newKeys.create({ friendlyName: "Shellphone API key" });
		}
	}
	if (newApiKey) {
		await db.organization.update({
			where: { id: organizationId },
			data: {
				twilioApiKey: newApiKey.sid,
				twilioApiSecret: newApiKey.secret,
			},
		});
	}

	const phoneNumberId = phoneNumberSid;
	let promises = [
		setTwilioWebhooks.enqueue(
			{ organizationId, phoneNumberId },
			{ id: `set-twilio-webhooks-${organizationId}-${phoneNumberId}` },
		),
	];

	const hasActiveSubscription = organization.subscriptions.length > 0;
	if (hasActiveSubscription) {
		promises.push(
			fetchMessagesQueue.enqueue(
				{ organizationId, phoneNumberId },
				{ id: `fetch-messages-${organizationId}-${phoneNumberId}` },
			),
			fetchCallsQueue.enqueue(
				{ organizationId, phoneNumberId },
				{ id: `fetch-messages-${organizationId}-${phoneNumberId}` },
			),
		);
	}

	await Promise.all(promises);
});
