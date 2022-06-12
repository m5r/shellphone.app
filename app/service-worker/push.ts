import type { NotificationPayload } from "~/utils/web-push.server";
import { addBadge } from "~/utils/pwa.client";

declare const self: ServiceWorkerGlobalScope;

const defaultOptions: NotificationOptions = {
	icon: "/icons/android-chrome-192x192.png",
	badge: "/icons/android-chrome-48x48.png",
	dir: "auto",
	image: undefined,
	silent: false,
};

export default async function handlePush(event: PushEvent) {
	const payload: NotificationPayload = event.data!.json();
	const options = Object.assign({}, defaultOptions, payload);

	const revalidateChannel = new BroadcastChannel("revalidate");
	// should revalidate just "/messages" and `/messages/${encodeURIComponent(payload.data.recipient)}`
	revalidateChannel.postMessage("revalidateLoaderData");
	revalidateChannel.close();

	const clients = await self.clients.matchAll({ type: "window" });
	const hasOpenTab = clients.some((client) => client.focused === true);
	if (hasOpenTab) {
		const notifyChannel = new BroadcastChannel("notifications");
		notifyChannel.postMessage(JSON.stringify(payload));
		notifyChannel.close();
	} else {
		await self.registration.showNotification(payload.title, options);
		await addBadge(1);
	}
}
