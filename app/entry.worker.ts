/// <reference lib="WebWorker" />

import handleInstall from "./service-worker/install";
import handleActivate from "./service-worker/activate";
import handlePush from "./service-worker/push";
import handleNotificationClick from "./service-worker/notification-click";
import handleFetch from "./service-worker/fetch";
import handleMessage from "./service-worker/message";

declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", (event) => {
	event.waitUntil(handleInstall(event).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
	event.waitUntil(handleActivate(event).then(() => self.clients.claim()));
});

self.addEventListener("push", (event) => {
	event.waitUntil(handlePush(event));
});

self.addEventListener("notificationclick", (event) => {
	event.waitUntil(handleNotificationClick(event));
});

self.addEventListener("message", (event) => {
	event.waitUntil(handleMessage(event));
});

self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);
	const isSSERequest = event.request.headers.get("Accept") === "text/event-stream";
	const isOutsideRequest = !["localhost", "dev.shellphone.app", "www.shellphone.app"].includes(url.hostname);
	const isSplitbeeProxiedRequest = url.pathname.startsWith("/_hive") || url.pathname === "/bee.js";
	if (isSSERequest || isOutsideRequest || isSplitbeeProxiedRequest) {
		return;
	}

	event.respondWith(handleFetch(event));
});
