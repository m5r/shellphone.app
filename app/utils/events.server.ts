import { EventEmitter } from "events";

import type { NotificationPayload } from "~/utils/web-push.server";

declare global {
	var notifications: EventEmitter;
}

global.notifications = global.notifications || new EventEmitter();

export const events = global.notifications;

export function notifySSE(payload: NotificationPayload) {
	global.notifications.emit("notification", payload);
}
