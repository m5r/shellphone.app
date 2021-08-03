import { Routes } from "blitz";

const worker = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

worker.addEventListener("push", function (event) {
	if (!event.data) {
		return;
	}

	console.log("event.data.text()", event.data.text());
	const data = JSON.parse(event.data.text());
	event.waitUntil(
		worker.registration.showNotification(data.title, {
			body: data.message,
			icon: "/icons/android-chrome-192x192.png",
			actions: [
				{ title: "Open", action: "open" },
				{ title: "Mark as read", action: "mark-as-read" },
			],
		}),
	);
});

worker.addEventListener("notificationclick", (event) => {
	event.notification.close();
	event.waitUntil(
		worker.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
			if (!event.notification.data) {
				return;
			}

			switch (event.action) {
				case "mark-as-read":
					// TODO
					return;
				case "open":
				default: {
					const data = JSON.parse(event.notification.data.text());
					const route = Routes.ConversationPage({ recipient: data.recipient });
					const url = `${route.pathname}${route.query}`;

					if (clientList.length > 0) {
						const client = clientList.find((client) => client.focused) ?? clientList[0]!;

						client.navigate(url);
						return client.focus();
					}
					return worker.clients.openWindow(url);
				}
			}
		}),
	);
});
