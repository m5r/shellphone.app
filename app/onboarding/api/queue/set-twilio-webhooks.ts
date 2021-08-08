import { getConfig } from "blitz";
import { Queue } from "quirrel/blitz";
import twilio from "twilio";
import type { ApplicationInstance } from "twilio/lib/rest/api/v2010/account/application";

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

	const mainTwilioClient = twilio(organization.twilioAccountSid, organization.twilioAuthToken);
	const [twimlApp, apiKey] = await Promise.all([
		getTwimlApplication(mainTwilioClient, organization.twimlAppSid),
		mainTwilioClient.newKeys.create({ friendlyName: "Shellphone API key" }),
	]);
	const twimlAppSid = twimlApp.sid;

	await Promise.all([
		db.organization.update({
			where: { id: organizationId },
			data: {
				twimlAppSid,
				twilioApiKey: apiKey.sid,
				twilioApiSecret: apiKey.secret,
			},
		}),
		mainTwilioClient.incomingPhoneNumbers.get(phoneNumber.id).update({
			smsApplicationSid: twimlAppSid,
			voiceApplicationSid: twimlAppSid,
		}),
	]);
});

async function getTwimlApplication(
	twilioClient: twilio.Twilio,
	organizationTwimlAppSid: string | null,
): Promise<ApplicationInstance> {
	try {
		if (organizationTwimlAppSid) {
			return updateTwimlApplication(twilioClient, organizationTwimlAppSid);
		}
	} catch {
		// twiml app with sid `organizationTwimlAppSid` probably doesn't exist anymore
	}

	const twimlApps = await twilioClient.applications.list();
	const twimlApp = twimlApps.find((app) => app.friendlyName === "Shellphone");
	if (twimlApp) {
		return updateTwimlApplication(twilioClient, twimlApp.sid);
	}

	return twilioClient.applications.create({
		friendlyName: "Shellphone",
		smsUrl: `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/incoming-message`,
		smsMethod: "POST",
		voiceUrl: `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/incoming-call`,
		voiceMethod: "POST",
	});
}

async function updateTwimlApplication(twilioClient: twilio.Twilio, twimlAppSid: string) {
	await twilioClient.applications.get(twimlAppSid).update({
		smsUrl: `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/incoming-message`,
		smsMethod: "POST",
		voiceUrl: `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/incoming-call`,
		voiceMethod: "POST",
	});

	return twilioClient.applications.get(twimlAppSid).fetch();
}

export default setTwilioWebhooks;
