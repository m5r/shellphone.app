import { NotFoundError } from "blitz";
import { Queue } from "quirrel/blitz";
import { PaddleSdkSubscriptionUpdatedEvent } from "@devoxa/paddle-sdk";

import db, { MembershipRole } from "db";
import appLogger from "integrations/logger";
import { sendEmail } from "integrations/aws-ses";
import type { Metadata } from "integrations/paddle";
import { translateSubscriptionStatus } from "integrations/paddle";

const logger = appLogger.child({ module: "subscription-updated" });

type Payload = {
	event: PaddleSdkSubscriptionUpdatedEvent<Metadata>;
};

export const subscriptionUpdatedQueue = Queue<Payload>("api/queue/subscription-updated", async ({ event }) => {
	const paddleSubscriptionId = event.subscriptionId;
	const subscription = await db.subscription.findFirst({
		where: { paddleSubscriptionId },
		include: {
			organization: {
				include: {
					memberships: {
						include: { user: true },
					},
				},
			},
		},
	});
	if (!subscription) {
		throw new NotFoundError();
	}

	const lastEventTime = event.eventTime;
	const isEventOlderThanLastUpdate = subscription.lastEventTime > lastEventTime;
	if (isEventOlderThanLastUpdate) {
		return;
	}

	const orgOwner = subscription.organization!.memberships.find(
		(membership) => membership.role === MembershipRole.OWNER,
	);
	const email = orgOwner!.user!.email;
	const planId = event.productId;
	await db.subscription.update({
		where: { paddleSubscriptionId },
		data: {
			paddleSubscriptionId,
			paddlePlanId: planId,
			paddleCheckoutId: event.checkoutId,
			nextBillDate: event.nextPaymentDate,
			status: translateSubscriptionStatus(event.status),
			lastEventTime,
			updateUrl: event.updateUrl,
			cancelUrl: event.cancelUrl,
			currency: event.currency,
			unitPrice: event.unitPrice,
		},
	});

	sendEmail({
		subject: "Thanks for your purchase",
		text: "Thanks for your purchase",
		html: "Thanks for your purchase",
		recipients: [email],
	}).catch((error) => {
		logger.error(error);
	});
});

export default subscriptionUpdatedQueue;
