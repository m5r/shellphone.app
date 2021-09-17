import { getConfig, useMutation } from "blitz";
import { useEffect, useMemo, useState } from "react";

import setNotificationSubscription from "../mutations/set-notification-subscription";
import useCurrentPhoneNumber from "./use-current-phone-number";

const { publicRuntimeConfig } = getConfig();

export default function useNotifications() {
	const isServiceWorkerSupported = useMemo(() => "serviceWorker" in navigator, []);
	const [subscription, setSubscription] = useState<PushSubscription | null>(null);
	const [setNotificationSubscriptionMutation] = useMutation(setNotificationSubscription);
	const phoneNumber = useCurrentPhoneNumber();

	useEffect(() => {
		(async () => {
			if (!isServiceWorkerSupported) {
				return;
			}

			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.getSubscription();
			setSubscription(subscription);
		})();
	}, [isServiceWorkerSupported]);

	async function subscribe() {
		if (!isServiceWorkerSupported || !phoneNumber) {
			return;
		}

		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(publicRuntimeConfig.webPush.publicKey),
		});
		setSubscription(subscription);
		await setNotificationSubscriptionMutation({
			phoneNumberId: phoneNumber.id,
			subscription: subscription.toJSON() as any,
		}); // TODO remove as any
	}

	async function unsubscribe() {
		if (!isServiceWorkerSupported) {
			return;
		}

		return subscription?.unsubscribe();
	}

	return {
		isServiceWorkerSupported,
		subscription,
		subscribe,
		unsubscribe,
	};
}

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
