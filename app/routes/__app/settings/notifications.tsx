import type { ActionFunction } from "@remix-run/node";
import { ClientOnly } from "remix-utils";
import { Form } from "@remix-run/react";

import Button from "~/features/settings/components/button";
import NotificationsSettings, {
	FallbackNotificationsSettings,
} from "~/features/settings/components/settings/notifications-settings";
import notifyIncomingMessageQueue from "~/queues/notify-incoming-message.server";

export const action: ActionFunction = async () => {
	await notifyIncomingMessageQueue.add("ddd", {
		messageSid: "SM07ef9eb508f4e04bff596f11ac90e835",
		phoneNumberId: "PNb77c9690c394368bdbaf20ea6fe5e9fc",
	});
	return null;
};

export default function Notifications() {
	return (
		<section className="pt-6 divide-y divide-gray-200">
			<div className="px-4 sm:px-6">
				<h2 className="text-lg leading-6 font-medium text-gray-900">Notifications</h2>
				<ClientOnly fallback={<FallbackNotificationsSettings />}>{() => <NotificationsSettings />}</ClientOnly>
			</div>

			<section>
				<Form method="post">
					<Button variant="default" type="submit">
						send it!!!
					</Button>
				</Form>
			</section>
		</section>
	);
}
