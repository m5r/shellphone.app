import webpush, { type PushSubscription, WebPushError } from "web-push";
import type { NotificationSubscription } from "@prisma/client";

import serverConfig from "~/config/config.server";
import db from "~/utils/db.server";
import logger from "~/utils/logger.server";

export type NotificationPayload = NotificationOptions & {
	title: string; // max 50 characters
	body: string; // max 150 characters
};

export async function notify(subscriptions: NotificationSubscription[], payload: NotificationPayload) {
	webpush.setVapidDetails("mailto:mokht@rmi.al", serverConfig.webPush.publicKey, serverConfig.webPush.privateKey);
	const title = truncate(payload.title, 50);
	const body = truncate(payload.body, 150);
	const _payload = JSON.stringify({
		...payload,
		title,
		body,
	});

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
				await webpush.sendNotification(webPushSubscription, _payload);
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

function truncate(str: string, maxLength: number) {
	if (str.length <= maxLength) {
		return str;
	}

	return str.substring(0, maxLength - 1) + "\u2026";
}
