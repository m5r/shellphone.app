import type { LoaderFunction } from "@remix-run/node";

import db from "~/utils/db.server";
import logger from "~/utils/logger.server";

export const loader: LoaderFunction = async ({ request }) => {
	const host = request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

	try {
		const queues = [...__registeredQueues!.entries()];
		const url = new URL("/", `http://${host}`);
		// if our queues and cron jobs are healthy,
		// and can connect to the database and make a simple query,
		// and can make a HEAD request to ourselves, then we're good.
		await Promise.all([
			...queues.map(async ([queueName, { queue, worker, scheduler }]) => {
				if (await queue.isPaused()) {
					throw new Error(`Queue "${queueName}" is paused`);
				}

				if (!worker.isRunning()) {
					throw new Error(`Queue "${queueName}"'s worker is not running`);
				}

				if (!scheduler.isRunning()) {
					throw new Error(`Queue "${queueName}"'s scheduler is not running`);
				}
			}),
			db.user.count(),
			fetch(url.toString(), { method: "HEAD" }).then((r) => {
				if (!r.ok) return Promise.reject(r);
			}),
		]);
		return new Response("OK");
	} catch (error: unknown) {
		logger.error("healthcheck ❌", { error });
		return new Response("ERROR", { status: 500 });
	}
};
