import path from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { GlobalRole } from "@prisma/client";

import cronJobs from "~/cron-jobs";
import queues from "~/queues";
import logger from "~/utils/logger.server";
import { __getSession } from "~/utils/session.server";
import { type SessionData } from "~/utils/auth.server";

const app = express();
app.use((req, res, next) => {
	res.set("X-Fly-Region", process.env.FLY_REGION ?? "unknown");
	res.set("Strict-Transport-Security", `max-age=31536000; preload`);
	next();
});

// replay non-GET/HEAD/OPTIONS requests to the primary Fly.io region rather than read-only Postgres instances
// learn more: https://fly.io/docs/getting-started/multi-region-databases/#replay-the-request
app.all("*", (req, res, next) => {
	const { method, path: pathname } = req;
	const { PRIMARY_REGION, FLY_REGION } = process.env;
	const isMethodReplayable = !["GET", "OPTIONS", "HEAD"].includes(method);
	const isReadOnlyRegion = FLY_REGION && PRIMARY_REGION && FLY_REGION !== PRIMARY_REGION;
	const shouldReplay = isMethodReplayable && isReadOnlyRegion;

	if (!shouldReplay) {
		return next();
	}

	const logInfo = {
		pathname,
		method,
		PRIMARY_REGION,
		FLY_REGION,
	};
	logger.info("Replaying:", logInfo);
	res.set("fly-replay", `region=${PRIMARY_REGION}`);
	return res.sendStatus(409);
});

app.disable("x-powered-by");
app.use(
	compression({
		filter(req, res) {
			const contentTypeHeader = res.getHeader("Content-Type");
			let contentType = "";
			if (contentTypeHeader) {
				if (Array.isArray(contentTypeHeader)) {
					contentType = contentTypeHeader.join(" ");
				} else {
					contentType = String(contentTypeHeader);
				}
			}

			if (contentType.includes("text/event-stream")) {
				return false;
			}

			return true;
		},
	}),
);

// cache static and immutable assets
app.use(express.static("public", { immutable: true, maxAge: "1y" }));

// setup background queues and cron jobs
app.use("/admin", adminMiddleware);
app.use("/admin/queues", setupBullBoard().getRouter());

app.use(morgan("tiny"));

app.all("*", (req, res, next) => {
	if (process.env.NODE_ENV !== "production") {
		purgeRequireCache();
	}

	return createRequestHandler({
		build: require("./build"),
		mode: process.env.NODE_ENV,
	})(req, res, next);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	require("./build"); // preload the build so we're ready for the first request
	logger.info(`Server listening on port ${port}`);
});

async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
	const session = await __getSession(req.headers.cookie);
	const sessionData: SessionData | undefined = session.data.user;
	if (!sessionData || sessionData.user.role !== GlobalRole.SUPERADMIN) {
		return res.setHeader("Location", "/sign-in").status(302).end();
	}

	next();
}

function setupBullBoard() {
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

const buildDir = path.join(process.cwd(), "build");
function purgeRequireCache() {
	for (const key in require.cache) {
		if (key.startsWith(buildDir)) {
			delete require.cache[key];
		}
	}
}
