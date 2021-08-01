import { getConfig } from "blitz";
import { Queue } from "quirrel/blitz";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import twilio from "twilio";
import webpush, { PushSubscription, WebPushError } from "web-push";

import db from "../../../../db";
import appLogger from "../../../../integrations/logger";

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
const logger = appLogger.child({ queue: "notify-incoming-message" });

type Payload = {
	customerId: string;
	messageSid: MessageInstance["sid"];
};

const notifyIncomingMessageQueue = Queue<Payload>(
	"api/queue/notify-incoming-message",
	async ({ messageSid, customerId }) => {
		webpush.setVapidDetails(
			"mailto:mokht@rmi.al",
			publicRuntimeConfig.webPush.publicKey,
			serverRuntimeConfig.webPush.privateKey,
		);

		const customer = await db.customer.findFirst({ where: { id: customerId } });
		if (!customer || !customer.accountSid || !customer.authToken) {
			return;
		}

		const message = await twilio(customer.accountSid, customer.authToken).messages.get(messageSid).fetch();
		const notification = { message: `${message.from} - ${message.body}` };
		const subscriptions = await db.notificationSubscription.findMany({ where: { customerId: customer.id } });
		await Promise.all(
			subscriptions.map(async (subscription) => {
				const webPushSubscription: PushSubscription = {
					endpoint: subscription.endpoint,
					keys: {
						p256dh: subscription.keys_p256dh,
						auth: subscription.keys_auth,
					},
				};

				try {
					await webpush.sendNotification(webPushSubscription, JSON.stringify(notification));
				} catch (error) {
					logger.error(error);
					if (error instanceof WebPushError) {
						// subscription most likely expired
						await db.notificationSubscription.delete({ where: { id: subscription.id } });
					}
				}
			}),
		);
	},
);

export default notifyIncomingMessageQueue;
