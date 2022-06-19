import Toggle from "~/features/settings/components/settings/toggle";
import useNotifications from "~/features/core/hooks/use-notifications.client";
import { useEffect, useState } from "react";

export default function NotificationsSettings() {
	const { isNotificationSupported, subscription, subscribe, unsubscribe } = useNotifications();
	const [notificationsEnabled, setNotificationsEnabled] = useState(!!subscription);
	const [errorMessage, setErrorMessage] = useState(() =>
		isNotificationSupported
			? ""
			: "Your browser does not support web push notifications. You will still receive in-app notifications as long as you have Shellphone open.",
	);
	const [isChanging, setIsChanging] = useState(false);
	const onChange = async (checked: boolean) => {
		if (isChanging) {
			return;
		}

		setIsChanging(true);
		setNotificationsEnabled(checked);
		setErrorMessage("");
		try {
			if (checked) {
				await subscribe();
			} else {
				await unsubscribe();
			}
		} catch (error: any) {
			console.error(error);
			setNotificationsEnabled(!checked);
			if (!checked) {
				unsubscribe().catch((error) => console.error(error));
			}

			switch (error.name) {
				case "NotAllowedError":
					setErrorMessage(
						"Your browser is not allowing Shellphone to register push notifications for you. Please allow Shellphone's notifications in your browser's settings if you wish to receive them.",
					);
					break;
				case "TypeError":
					setErrorMessage("Your browser does not support push notifications yet.");
					break;
			}
		} finally {
			setIsChanging(false);
		}
	};
	useEffect(() => {
		setNotificationsEnabled(!!subscription);
	}, [subscription]);

	if (typeof subscription === "undefined") {
		return <FallbackNotificationsSettings />;
	}

	// TODO: allow disabling in-app notifications
	return (
		<ul className="mt-2 divide-y divide-gray-200">
			<Toggle
				as="li"
				checked={notificationsEnabled}
				description="Get notified on this device when you receive a message or a phone call"
				onChange={onChange}
				title="Enable notifications"
				error={
					errorMessage
						? {
								title: "Browser error",
								message: errorMessage,
						  }
						: null
				}
			/>
		</ul>
	);
}

export function FallbackNotificationsSettings() {
	return (
		<ul className="mt-2 divide-y divide-gray-200">
			<Toggle
				as="li"
				checked={false}
				description="Get notified on this device when you receive a message or a phone call"
				onChange={() => void 0}
				title="Enable notifications"
				error={null}
				isLoading
			/>
		</ul>
	);
}
