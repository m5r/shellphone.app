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
	organizationId: string;
	phoneNumberId: string;
	messageSid: MessageInstance["sid"];
};

const notifyIncomingMessageQueue = Queue<Payload>(
	"api/queue/notify-incoming-message",
	async ({ messageSid, organizationId, phoneNumberId }) => {
		webpush.setVapidDetails(
			"mailto:mokht@rmi.al",
			publicRuntimeConfig.webPush.publicKey,
			serverRuntimeConfig.webPush.privateKey,
		);

		const organization = await db.organization.findFirst({
			where: { id: organizationId },
		});
		if (!organization || !organization.twilioAccountSid || !organization.twilioAuthToken) {
			return;
		}

		const message = await twilio(organization.twilioAccountSid, organization.twilioAuthToken)
			.messages.get(messageSid)
			.fetch();
		const notification = { message: `${message.from} - ${message.body}` };
		const subscriptions = await db.notificationSubscription.findMany({ where: { organizationId, phoneNumberId } });
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
				} catch (error: any) {
					logger.error(error);
					if (error instanceof WebPushError) {
						// subscription most likely expired or has been revoked
						await db.notificationSubscription.delete({ where: { id: subscription.id } });
					}
				}
			}),
		);
	},
);

export default notifyIncomingMessageQueue;
