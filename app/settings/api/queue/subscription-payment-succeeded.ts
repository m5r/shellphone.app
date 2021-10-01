import { NotFoundError } from "blitz";
import { Queue } from "quirrel/blitz";
import { PaddleSdkSubscriptionPaymentSucceededEvent } from "@devoxa/paddle-sdk";

import db from "db";
import appLogger from "integrations/logger";
import type { Metadata } from "integrations/paddle";
import { translateSubscriptionStatus } from "integrations/paddle";

const logger = appLogger.child({ queue: "subscription-payment-succeeded" });

type Payload = {
	event: PaddleSdkSubscriptionPaymentSucceededEvent<Metadata>;
};

export const subscriptionPaymentSucceededQueue = Queue<Payload>(
	"api/queue/subscription-payment-succeeded",
	async ({ event }) => {
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
				nextBillDate: event.nextPaymentDate,
				status: translateSubscriptionStatus(event.status),
				lastEventTime,
				currency: event.currency,
				unitPrice: event.unitPrice,
			},
		});
	},
);

export default subscriptionPaymentSucceededQueue;
