import type { NextFunction, Request, Response } from "express";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { createBullBoard } from "@bull-board/api";
import { GlobalRole } from "@prisma/client";

import { __getSession } from "~/utils/session.server";
import type { SessionData } from "~/utils/auth.server";
import queues from "~/queues";
import cronJobs from "~/cron-jobs";

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
	const session = await __getSession(req.headers.cookie);
	const sessionData: SessionData | undefined = session.data.user;
	if (!sessionData || sessionData.user.role !== GlobalRole.SUPERADMIN) {
		return res.setHeader("Location", "/sign-in").status(302).end();
	}

	next();
}

export function setupBullBoard() {
	const serverAdapter = new ExpressAdapter();
	const cronJobsQueues = registerCronJobs();
	createBullBoard({
		queues: [...queues, ...cronJobsQueues].map((queue) => new BullMQAdapter(queue)),
		serverAdapter,
	});
	serverAdapter.setBasePath("/admin/queues");
	return serverAdapter;
}

function registerCronJobs() {
	return cronJobs.map((registerCronJob) => registerCronJob());
}
