/// <reference lib="WebWorker" />

import type { NotificationPayload } from "~/utils/web-push.server";
import { addBadge, removeBadge } from "~/utils/pwa.client";

declare let self: ServiceWorkerGlobalScope;

const defaultOptions: NotificationOptions = {
	icon: "/icons/android-chrome-192x192.png",
	badge: "/icons/android-chrome-48x48.png",
	dir: "auto",
	image: undefined,
	silent: false,
};

self.addEventListener("push", (event) => {
	const { title, ...payload }: NotificationPayload = JSON.parse(event?.data!.text());
	const options = Object.assign({}, defaultOptions, payload);
	event.waitUntil(async () => {
		await self.registration.showNotification(title, options);
		await addBadge(1);
	});
});

self.addEventListener("notificationclick", (event) => {
	event.waitUntil(
		(async () => {
			console.log("On notification click: ", event.notification.tag);
			// Android doesn’t close the notification when you click on it
			// See: http://crbug.com/463146
			event.notification.close();
			await removeBadge();

			if (event.action === "reply") {
				const recipient = encodeURIComponent(event.notification.data.recipient);
				return self.clients.openWindow?.(`/messages/${recipient}`);
			}

			if (event.action === "answer") {
				const recipient = encodeURIComponent(event.notification.data.recipient);
				return self.clients.openWindow?.(`/incoming-call/${recipient}`);
			}

			return self.clients.openWindow?.("/");
		})(),
	);
});
