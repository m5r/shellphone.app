import type { Context, Middleware } from "koa";
import { transports, format } from "winston";
import path from "path";

import config from "./config";

const logger = (winstonInstance: typeof import("winston")): Middleware => {
	winstonInstance.configure({
		level: config.debugLogging ? "debug" : "info",
		transports: [
			// - Write all logs error (and below) to `error.log`.
			new transports.File({ filename: path.resolve(__dirname, "../error.log"), level: "error" }),
			// - Write to all logs with specified level to console.
			new transports.Console({
				format: format.combine(
					format.colorize(),
					format.simple(),
				),
			}),
		],
	});

	return async (ctx: Context, next: () => Promise<any>): Promise<void> => {
		const start = Date.now();
		try {
			await next();
		} catch (err) {
			ctx.status = err.status || 500;
			ctx.body = err.message;
		}
		const ms = Date.now() - start;

		let logLevel: string;
		if (ctx.status >= 500) {
			logLevel = "error";
		} else if (ctx.status >= 400) {
			logLevel = "warn";
		} else {
			logLevel = "info";
		}

		const msg = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;

		winstonInstance.log(logLevel, msg);
	};
};

export default logger;
