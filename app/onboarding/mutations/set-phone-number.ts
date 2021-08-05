import { resolver } from "blitz";
import { z } from "zod";
import twilio from "twilio";

import db from "../../../db";
import getCurrentUser from "../../users/queries/get-current-user";
import fetchMessagesQueue from "../../messages/api/queue/fetch-messages";
import fetchCallsQueue from "../../phone-calls/api/queue/fetch-calls";
import setTwilioWebhooks from "../api/queue/set-twilio-webhooks";

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
	context.session.$setPrivateData({ hasCompletedOnboarding: true });

	const phoneNumberId = phoneNumberSid;
	await Promise.all([
		fetchMessagesQueue.enqueue(
			{ organizationId, phoneNumberId },
			{ id: `fetch-messages-${organizationId}-${phoneNumberId}` },
		),
		fetchCallsQueue.enqueue(
			{ organizationId, phoneNumberId },
			{ id: `fetch-messages-${organizationId}-${phoneNumberId}` },
		),
		setTwilioWebhooks.enqueue(
			{ organizationId, phoneNumberId },
			{ id: `set-twilio-webhooks-${organizationId}-${phoneNumberId}` },
		),
	]);
});
