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
				let keepAliveTimeout = setTimeout(keepAlive, 30 * 1000);
				let closed = false;

				events.addListener("notification", onNotification);
				request.signal.addEventListener("abort", close);
				if (request.signal.aborted) {
					close();
					return;
				}

				function onNotification(notification: NotificationPayload) {
					controller.enqueue(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`));
				}

				function keepAlive() {
					if (closed) {
						return;
					}

					controller.enqueue(encoder.encode(":\n\n"));
					keepAliveTimeout = setTimeout(keepAlive, 30 * 1000);
				}

				function close() {
					if (closed) {
						return;
					}

					closed = true;
					clearTimeout(keepAliveTimeout);
					events.removeListener("notification", onNotification);
					request.signal.removeEventListener("abort", close);
					controller.close();
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
