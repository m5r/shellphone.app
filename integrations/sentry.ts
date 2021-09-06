import * as Sentry from "@sentry/node";
import getConfig from "next/config";
import type { Integration } from "@sentry/types";
import { RewriteFrames } from "@sentry/integrations";
import { Integrations as TracingIntegrations } from "@sentry/tracing";

if (process.env.SENTRY_DSN) {
	const config = getConfig();
	const distDir = `${config.serverRuntimeConfig.rootDir}/.next`;
	const integrations: Integration[] = [
		new RewriteFrames({
			iteratee: (frame) => {
				frame.filename = frame.filename!.replace(distDir, "app:///_next");
				return frame;
			},
		}),
	];
	if (typeof window !== "undefined") {
		integrations.push(new TracingIntegrations.BrowserTracing());
	} else {
		integrations.push(new Sentry.Integrations.Http({ tracing: true }));
	}

	Sentry.init({
		integrations,
		tracesSampleRate: 0.5,
		dsn: process.env.SENTRY_DSN,
		beforeSend(event, hint) {
			const error = hint?.originalException;
			if (error && typeof error !== "string") {
				switch (error.name) {
					case "AuthenticationError":
					case "AuthorizationError":
					case "NotFoundError":
					case "ChunkLoadError":
						return null;
				}
			}
			return event;
		},
	});
}

export default Sentry;
