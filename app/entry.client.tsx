import { hydrate } from "react-dom";
import { RemixBrowser } from "@remix-run/react";

hydrate(<RemixBrowser />, document);

if ("serviceWorker" in navigator) {
	window.addEventListener("load", async () => {
		try {
			await navigator.serviceWorker.register("/entry.worker.js");
			await navigator.serviceWorker.ready;
		} catch (error) {
			console.error("Service worker registration failed", error, (error as Error).name);
		}
	});
}
