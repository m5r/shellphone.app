import { type ElementType, useEffect, useState } from "react";
import type { ActionFunction } from "@remix-run/node";
import { ClientOnly } from "remix-utils";
import { Switch } from "@headlessui/react";
import clsx from "clsx";

import useNotifications from "~/features/core/hooks/use-notifications.client";
import Alert from "~/features/core/components/alert";
import { Form } from "@remix-run/react";
import { notify } from "~/utils/web-push.server";
import Button from "~/features/settings/components/button";

export const action: ActionFunction = async () => {
	await notify("PN4f11f0c4155dfb5d5ac8bbab2cc23cbc", {
		title: "+33 6 13 37 07 87",
		body: "wesh le zin, wesh la zine, copain copine mais si y'a moyen on pine",
		actions: [
			{
				action: "reply",
				title: "Reply",
			},
		],
		data: { recipient: "+33613370787" },
	});
	return null;
};

export default function NotificationsPage() {
	return <ClientOnly fallback={<Loader />}>{() => <Notifications />}</ClientOnly>;
}

function Notifications() {
	const { subscription, subscribe, unsubscribe } = useNotifications();
	const [notificationsEnabled, setNotificationsEnabled] = useState(!!subscription);
	const [errorMessage, setErrorMessage] = useState("");
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

	return (
		<section className="pt-6 divide-y divide-gray-200">
			<section>
				<Form method="post">
					<Button variant="default" type="submit">
						send it!!!
					</Button>
				</Form>
			</section>
			<div className="px-4 sm:px-6">
				<div>
					<h2 className="text-lg leading-6 font-medium text-gray-900">Notifications</h2>
				</div>
				<ul className="mt-2 divide-y divide-gray-200">
					<Toggle
						as="li"
						checked={notificationsEnabled}
						description="Get notified on this device when you receive a message or a phone call"
						onChange={onChange}
						title="Enable notifications"
					/>
				</ul>
				{errorMessage !== "" && <Alert title="Browser error" message={errorMessage} variant="error" />}
			</div>
		</section>
	);
}

type ToggleProps = {
	as?: ElementType;
	checked: boolean;
	description?: string;
	onChange(checked: boolean): void;
	title: string;
};

function Toggle({ as, checked, description, onChange, title }: ToggleProps) {
	return (
		<Switch.Group as={as} className="py-4 flex items-center justify-between">
			<div className="flex flex-col">
				<Switch.Label as="p" className="text-sm font-medium text-gray-900" passive>
					{title}
				</Switch.Label>
				{description && (
					<Switch.Description as="span" className="text-sm text-gray-500">
						{description}
					</Switch.Description>
				)}
			</div>
			<Switch
				checked={checked}
				onChange={onChange}
				className={clsx(
					checked ? "bg-primary-500" : "bg-gray-200",
					"ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500",
				)}
			>
				<span
					aria-hidden="true"
					className={clsx(
						checked ? "translate-x-5" : "translate-x-0",
						"inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200",
					)}
				/>
			</Switch>
		</Switch.Group>
	);
}

function Loader() {
	return (
		<svg
			className="animate-spin mx-auto h-5 w-5 text-primary-700"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
}
