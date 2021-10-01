import { NotFoundError } from "blitz";
import { Queue } from "quirrel/blitz";
import type { PaddleSdkSubscriptionCancelledEvent } from "@devoxa/paddle-sdk";

import db from "db";
import appLogger from "integrations/logger";
import { translateSubscriptionStatus } from "integrations/paddle";

const logger = appLogger.child({ queue: "subscription-cancelled" });

type Payload = {
	event: PaddleSdkSubscriptionCancelledEvent<{ organizationId: string }>;
};

export const subscriptionCancelledQueue = Queue<Payload>("api/queue/subscription-cancelled", async ({ event }) => {
	const paddleSubscriptionId = event.subscriptionId;
	const subscription = await db.subscription.findFirst({ where: { paddleSubscriptionId } });
	if (!subscription) {
		throw new NotFoundError();
	}

	const lastEventTime = event.eventTime;
	const isEventOlderThanLastUpdate = subscription.lastEventTime > lastEventTime;
	if (isEventOlderThanLastUpdate) {
		return;
	}

	await db.subscription.update({
		where: { paddleSubscriptionId },
		data: {
			paddleSubscriptionId,
			paddlePlanId: event.productId,
			paddleCheckoutId: event.checkoutId,
			status: translateSubscriptionStatus(event.status),
			lastEventTime,
			currency: event.currency,
			unitPrice: event.unitPrice,
		},
	});
});

export default subscriptionCancelledQueue;
