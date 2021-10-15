import { resolver } from "blitz";
import { z } from "zod";
import twilio from "twilio";

import db from "db";
import getCurrentUser from "app/users/queries/get-current-user";
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

	const mainTwilioClient = twilio(organization.twilioAccountSid, organization.twilioAuthToken);
	const apiKey = await mainTwilioClient.newKeys.create({ friendlyName: "Shellphone API key" });
	await db.organization.update({
		where: { id: organizationId },
		data: {
			twilioApiKey: apiKey.sid,
			twilioApiSecret: apiKey.secret,
		},
	});

	const phoneNumberId = phoneNumberSid;
	await Promise.all([
		setTwilioWebhooks.enqueue(
			{ organizationId, phoneNumberId },
			{ id: `set-twilio-webhooks-${organizationId}-${phoneNumberId}` },
		),
	]);
});
