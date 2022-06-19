import { useEffect } from "react";
import { atom, useAtom } from "jotai";

import type { NotificationPayload } from "~/utils/web-push.server";

export default function useNotifications() {
	const [notificationData, setNotificationData] = useAtom(notificationDataAtom);

	useEffect(() => {
		const eventSource = new EventSource("/sse/notifications");
		eventSource.addEventListener("message", onMessage);

		return () => {
			eventSource.removeEventListener("message", onMessage);
			eventSource.close();
		};

		function onMessage(event: MessageEvent) {
			console.log("event.data", JSON.parse(event.data));
			const notifyChannel = new BroadcastChannel("notifications");
			notifyChannel.postMessage(event.data);
			notifyChannel.close();
		}
	}, []);

	useEffect(() => {
		const notifyChannel = new BroadcastChannel("notifications");
		async function eventHandler(event: MessageEvent) {
			const payload: NotificationPayload = JSON.parse(event.data);
			setNotificationData(payload);
		}

		notifyChannel.addEventListener("message", eventHandler);

		return () => {
			notifyChannel.removeEventListener("message", eventHandler);
			notifyChannel.close();
		};
	}, [setNotificationData]);

	useEffect(() => {
		if (!notificationData || notificationData.data.type === "call") {
			return;
		}

		const timeout = setTimeout(() => setNotificationData(null), 5000);
		return () => clearTimeout(timeout);
	}, [notificationData, setNotificationData]);
}

export const notificationDataAtom = atom<NotificationPayload | null>(null);
