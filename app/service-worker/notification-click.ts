import { removeBadge } from "~/utils/pwa.client";

declare const self: ServiceWorkerGlobalScope;

// noinspection TypeScriptUnresolvedVariable
export default async function handleNotificationClick(event: NotificationEvent) {
	console.debug("On notification click: ", event.notification.tag);
	// Android doesn’t close the notification when you click on it
	// See: http://crbug.com/463146
	event.notification.close();
	await removeBadge();

	const url = getUrl(event.notification.data);
	return self.clients.openWindow?.(url);
}

type NotificationData = {
	recipient: string;
	type: "message" | "incoming-call";
};

function getUrl(data: NotificationData) {
	const recipient = encodeURIComponent(data.recipient);
	switch (data.type) {
		case "message":
			return `/messages/${recipient}`;
		case "incoming-call":
			return `/incoming-call/${recipient}`;
		default:
			return "/messages";
	}
}
