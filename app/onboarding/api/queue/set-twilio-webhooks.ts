import { getConfig } from "blitz";
import { Queue } from "quirrel/blitz";
import type twilio from "twilio";
import type { ApplicationInstance } from "twilio/lib/rest/api/v2010/account/application";

import db from "../../../../db";
import getTwilioClient, { getTwiMLName, smsUrl, voiceUrl } from "../../../../integrations/twilio";

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
	const twilioClient = getTwilioClient(organization);
	const twimlApp = await getTwimlApplication(twilioClient, organization.twimlAppSid);
	const twimlAppSid = twimlApp.sid;

	await Promise.all([
		db.organization.update({
			where: { id: organizationId },
			data: { twimlAppSid },
		}),
		twilioClient.incomingPhoneNumbers.get(phoneNumber.id).update({
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
			return await updateTwimlApplication(twilioClient, organizationTwimlAppSid);
		}
	} catch {
		// twiml app with sid `organizationTwimlAppSid` probably doesn't exist anymore
	}

	const twimlApps = await twilioClient.applications.list();
	const twimlApp = twimlApps.find((app) => app.friendlyName.startsWith("Shellphone"));
	if (twimlApp) {
		return updateTwimlApplication(twilioClient, twimlApp.sid);
	}

	return twilioClient.applications.create({
		friendlyName: getTwiMLName(),
		smsUrl,
		smsMethod: "POST",
		voiceUrl,
		voiceMethod: "POST",
	});
}

async function updateTwimlApplication(twilioClient: twilio.Twilio, twimlAppSid: string) {
	await twilioClient.applications.get(twimlAppSid).update({
		friendlyName: getTwiMLName(),
		smsUrl,
		smsMethod: "POST",
		voiceUrl,
		voiceMethod: "POST",
	});

	return twilioClient.applications.get(twimlAppSid).fetch();
}

export default setTwilioWebhooks;
