import { useEffect, useMemo, useState } from "react";
import { useFetcher } from "@remix-run/react";

import useAppLoaderData from "~/features/core/hooks/use-app-loader-data";

export default function useNotifications() {
	const isServiceWorkerSupported = useMemo(() => "serviceWorker" in navigator, []);
	const [subscription, setSubscription] = useState<PushSubscription | null>(null);
	const { webPushPublicKey } = useAppLoaderData().config;
	const fetcher = useFetcher();
	const subscribeToNotifications = (subscription: PushSubscriptionJSON) => {
		fetcher.submit(
			{
				_action: "subscribe",
				subscription: JSON.stringify(subscription),
			},
			{ method: "post", action: "/notifications-subscription" },
		);
	};
	const unsubscribeFromNotifications = (subscriptionEndpoint: PushSubscription["endpoint"]) => {
		fetcher.submit(
			{
				_action: "unsubscribe",
				subscriptionEndpoint,
			},
			{ method: "post", action: "/notifications-subscription" },
		);
	};

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
		if (!isServiceWorkerSupported || subscription !== null || fetcher.state !== "idle") {
			return;
		}

		const registration = await navigator.serviceWorker.ready;
		const newSubscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(webPushPublicKey),
		});
		setSubscription(newSubscription);
		subscribeToNotifications(newSubscription.toJSON());
	}

	async function unsubscribe() {
		if (!isServiceWorkerSupported || !subscription || fetcher.state !== "idle") {
			return;
		}

		subscription
			.unsubscribe()
			.then(() => {
				console.log("Unsubscribed from notifications");
				setSubscription(null);
			})
			.catch((error) => console.error("Failed to unsubscribe from notifications", error));
		unsubscribeFromNotifications(subscription.endpoint);
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
	const base64 = (base64String + padding).replaceAll("-", "+").replaceAll("_", "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
