import { getConfig } from "blitz";
import { Queue } from "quirrel/blitz";
import twilio from "twilio";

import db from "../../../../db";

type Payload = {
	organizationId: string;
	phoneNumberId: string;
};

const { serverRuntimeConfig } = getConfig();

const setTwilioWebhooks = Queue<Payload>("api/queue/set-twilio-webhooks", async ({ organizationId, phoneNumberId }) => {
	const phoneNumber = await db.phoneNumber.findFirst({
		where: { id: phoneNumberId, organizationId },
		include: { organization: true },
	});
	if (!phoneNumber) {
		return;
	}

	const organization = phoneNumber.organization;
	if (!organization.twilioAccountSid || !organization.twilioAuthToken) {
		return;
	}

	const twimlApp = organization.twimlAppSid
		? await twilio(organization.twilioAccountSid, organization.twilioAuthToken)
				.applications.get(organization.twimlAppSid)
				.fetch()
		: await twilio(organization.twilioAccountSid, organization.twilioAuthToken).applications.create({
				friendlyName: "Shellphone",
				smsUrl: `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/incoming-message`,
				smsMethod: "POST",
				voiceUrl: `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/incoming-call`,
				voiceMethod: "POST",
		  });
	const twimlAppSid = twimlApp.sid;

	await Promise.all([
		db.organization.update({
			where: { id: organizationId },
			data: { twimlAppSid },
		}),
		twilio(organization.twilioAccountSid, organization.twilioAuthToken)
			.incomingPhoneNumbers.get(phoneNumber.id)
			.update({
				smsApplicationSid: twimlAppSid,
				voiceApplicationSid: twimlAppSid,
			}),
	]);
});

export default setTwilioWebhooks;
