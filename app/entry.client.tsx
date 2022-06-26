import { hydrate } from "react-dom";
import { RemixBrowser } from "@remix-run/react";
import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

declare global {
	interface Window {
		shellphoneConfig: {
			sentry: { dsn: string };
		};
	}
}

Sentry.init({
	dsn: window.shellphoneConfig.sentry.dsn,
	tracesSampleRate: 1.0,
	integrations: [new Integrations.BrowserTracing()],
});

hydrate(<RemixBrowser />, document);

if ("serviceWorker" in navigator) {
	window.addEventListener("load", async () => {
		try {
			await navigator.serviceWorker.register("/entry.worker.js");
			await navigator.serviceWorker.ready;

			if (navigator.serviceWorker.controller) {
				return navigator.serviceWorker.controller.postMessage({
					type: "SYNC_REMIX_MANIFEST",
					manifest: window.__remixManifest,
				});
			}

			navigator.serviceWorker.addEventListener("controllerchange", () => {
				navigator.serviceWorker.controller?.postMessage({
					type: "SYNC_REMIX_MANIFEST",
					manifest: window.__remixManifest,
				});
			});
		} catch (error) {
			console.error("Service worker registration failed", error, (error as Error).name);
		}
	});
}
