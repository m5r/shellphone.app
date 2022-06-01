import type { ActionFunction } from "@remix-run/node";
import { ClientOnly } from "remix-utils";
import { Form } from "@remix-run/react";

import { notify } from "~/utils/web-push.server";
import Button from "~/features/settings/components/button";
import NotificationsSettings, {
	FallbackNotificationsSettings,
} from "~/features/settings/components/settings/notifications-settings";
import db from "~/utils/db.server";

export const action: ActionFunction = async () => {
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { id: "PN4f11f0c4155dfb5d5ac8bbab2cc23cbc" },
		select: {
			organization: {
				select: {
					memberships: {
						select: { notificationSubscription: true },
					},
				},
			},
		},
	});
	const subscriptions = phoneNumber!.organization.memberships.flatMap(
		(membership) => membership.notificationSubscription,
	);
	await notify(subscriptions, {
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

export default function Notifications() {
	return (
		<section className="pt-6 divide-y divide-gray-200">
			<div className="px-4 sm:px-6">
				<h2 className="text-lg leading-6 font-medium text-gray-900">Notifications</h2>
				<ClientOnly fallback={<FallbackNotificationsSettings />}>{() => <NotificationsSettings />}</ClientOnly>
			</div>

			<section>
				<Form method="post" action="/settings/notifications">
					<Button variant="default" type="submit">
						send it!!!
					</Button>
				</Form>
			</section>
		</section>
	);
}
