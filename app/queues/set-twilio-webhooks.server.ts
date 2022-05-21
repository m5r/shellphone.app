import type twilio from "twilio";
import type { ApplicationInstance } from "twilio/lib/rest/api/v2010/account/application";

import { Queue } from "~/utils/queue.server";
import db from "~/utils/db.server";
import getTwilioClient, { getTwiMLName, smsUrl, voiceUrl } from "~/utils/twilio.server";

type Payload = {
	phoneNumberId: string;
	organizationId: string;
};

export default Queue<Payload>("set twilio webhooks", async ({ data }) => {
	const { phoneNumberId, organizationId } = data;
	const phoneNumber = await db.phoneNumber.findFirst({
		where: { id: phoneNumberId, organizationId },
		include: {
			organization: {
				select: {
					twilioAccount: {
						select: { accountSid: true, subAccountSid: true, twimlAppSid: true },
					},
				},
			},
		},
	});
	if (!phoneNumber || !phoneNumber.organization.twilioAccount) {
		return;
	}

	const twilioAccount = phoneNumber.organization.twilioAccount;
	const twilioClient = getTwilioClient(twilioAccount);
	const twimlApp = await getTwimlApplication(twilioClient, twilioAccount.twimlAppSid);
	const twimlAppSid = twimlApp.sid;

	await Promise.all([
		db.twilioAccount.update({
			where: { organizationId },
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
