import { Queue } from "~/utils/queue.server";
import db from "~/utils/db.server";
import logger from "~/utils/logger.server";
import getTwilioClient from "~/utils/twilio.server";
import { buildMessageNotificationPayload, notify } from "~/utils/web-push.server";
import { notifySSE } from "~/utils/events.server";

type Payload = {
	messageSid: string;
	phoneNumberId: string;
};

export default Queue<Payload>("notify incoming message", async ({ data }) => {
	const { messageSid, phoneNumberId } = data;
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { id: phoneNumberId },
		select: {
			twilioAccount: {
				include: { notificationSubscriptions: true },
			},
		},
	});
	if (!phoneNumber) {
		logger.warn(`No phone number found with id=${phoneNumberId}`);
		return;
	}
	const subscriptions = phoneNumber.twilioAccount.notificationSubscriptions;
	const twilioClient = getTwilioClient(phoneNumber.twilioAccount);
	const message = await twilioClient.messages.get(messageSid).fetch();
	const payload = buildMessageNotificationPayload(message);

	await notify(subscriptions, payload);
	await notifySSE(payload);
});
