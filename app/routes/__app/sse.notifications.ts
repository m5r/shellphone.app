import type { LoaderFunction } from "@remix-run/node";

import { events } from "~/utils/events.server";
import type { NotificationPayload } from "~/utils/web-push.server";

export let loader: LoaderFunction = ({ request }) => {
	if (!request.signal) {
		return new Response(null, { status: 500 });
	}

	return new Response(
		new ReadableStream({
			start(controller) {
				const encoder = new TextEncoder();
				const onNotification = (notification: NotificationPayload) => {
					controller.enqueue(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`));
				};

				let closed = false;
				function close() {
					if (closed) {
						return;
					}

					closed = true;
					events.removeListener("notification", onNotification);
					request.signal.removeEventListener("abort", close);
					controller.close();
				}

				events.addListener("notification", onNotification);
				request.signal.addEventListener("abort", close);
				if (request.signal.aborted) {
					close();
					return;
				}
			},
		}),
		{
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
			},
		},
	);
};
