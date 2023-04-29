import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";

import logger from "~/utils/logger.server";
import { adminMiddleware, setupBullBoard } from "./queues";
import { purgeRequireCache } from "./purge-require-cache";

const environment = process.env.NODE_ENV;
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
	if (environment !== "production") {
		purgeRequireCache();
	}

	return createRequestHandler({
		build: require("../build"),
		mode: environment,
	})(req, res, next);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	logger.info(`Server listening on port ${port}`);
});
