import webpush, { type PushSubscription, WebPushError } from "web-push";

import serverConfig from "~/config/config.server";
import db from "~/utils/db.server";
import logger from "~/utils/logger.server";

export type NotificationPayload = NotificationOptions & {
	title: string;
	body: string;
};

export async function notify(phoneNumberId: string, payload: NotificationPayload) {
	webpush.setVapidDetails("mailto:mokht@rmi.al", serverConfig.webPush.publicKey, serverConfig.webPush.privateKey);

	const phoneNumber = await db.phoneNumber.findUnique({
		where: { id: phoneNumberId },
		select: {
			organization: {
				select: {
					memberships: {
						select: { notificationSubscription: true },
					},
				},
			},
		},
	});
	if (!phoneNumber) {
		// TODO
		return;
	}

	const subscriptions = phoneNumber.organization.memberships.flatMap(
		(membership) => membership.notificationSubscription,
	);

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
				await webpush.sendNotification(webPushSubscription, JSON.stringify(payload));
			} catch (error: any) {
				logger.error(error);
				if (error instanceof WebPushError) {
					// subscription most likely expired or has been revoked
					await db.notificationSubscription.delete({ where: { id: subscription.id } });
				}
			}
		}),
	);
}
