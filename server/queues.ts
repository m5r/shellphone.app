import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { createBullBoard } from "@bull-board/api";

import queues from "~/queues";

export function setupBullBoard() {
	const serverAdapter = new ExpressAdapter();
	createBullBoard({
		queues: queues.map((queue) => new BullMQAdapter(queue)),
		serverAdapter,
	});
	serverAdapter.setBasePath("/admin/queues");
	return serverAdapter;
}
