import { useEffect } from "react";
import { atom, useAtom } from "jotai";

import type { NotificationPayload } from "~/utils/web-push.server";

export default function useNotifications() {
	const [notificationData, setNotificationData] = useAtom(notificationDataAtom);

	useEffect(() => {
		const channel = new BroadcastChannel("notifications");
		async function eventHandler(event: MessageEvent) {
			const payload: NotificationPayload = JSON.parse(event.data);
			setNotificationData(payload);
		}

		channel.addEventListener("message", eventHandler);

		return () => {
			channel.removeEventListener("message", eventHandler);
			channel.close();
		};
	}, []);

	useEffect(() => {
		if (!notificationData) {
			return;
		}

		const timeout = setTimeout(() => setNotificationData(null), 5000);
		return () => clearTimeout(timeout);
	}, [notificationData]);
}

export const notificationDataAtom = atom<NotificationPayload | null>(null);
