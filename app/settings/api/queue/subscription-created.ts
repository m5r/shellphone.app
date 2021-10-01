import { NotFoundError } from "blitz";
import { Queue } from "quirrel/blitz";
import type { PaddleSdkSubscriptionCreatedEvent } from "@devoxa/paddle-sdk";

import db, { MembershipRole } from "db";
import appLogger from "integrations/logger";
import { sendEmail } from "integrations/ses";
import { translateSubscriptionStatus } from "integrations/paddle";

const logger = appLogger.child({ queue: "subscription-created" });

type Payload = {
	event: PaddleSdkSubscriptionCreatedEvent<{ organizationId: string }>;
};

export const subscriptionCreatedQueue = Queue<Payload>("api/queue/subscription-created", async ({ event }) => {
	const { organizationId } = event.metadata;
	const organization = await db.organization.findFirst({
		where: { id: organizationId },
		include: {
			subscription: true,
			memberships: {
				include: { user: true },
			},
		},
	});
	if (!organization) {
		throw new NotFoundError();
	}

	const orgOwner = organization.memberships.find((membership) => membership.role === MembershipRole.OWNER);
	const email = orgOwner!.user!.email;
	const paddleCheckoutId = event.checkoutId;
	const paddleSubscriptionId = event.subscriptionId;
	const planId = event.productId;
	const nextBillDate = event.nextPaymentDate;
	const status = translateSubscriptionStatus(event.status);
	const lastEventTime = event.eventTime;
	const updateUrl = event.updateUrl;
	const cancelUrl = event.cancelUrl;
	const currency = event.currency;
	const unitPrice = event.unitPrice;

	if (!!organization.subscription) {
		await db.subscription.update({
			where: { paddleSubscriptionId: organization.subscription.paddleSubscriptionId },
			data: {
				paddleSubscriptionId,
				paddlePlanId: planId,
				paddleCheckoutId,
				nextBillDate,
				status,
				lastEventTime,
				updateUrl,
				cancelUrl,
				currency,
				unitPrice,
			},
		});

		sendEmail({
			subject: "Welcome back to Shellphone",
			body: "Welcome back to Shellphone",
			recipients: [email],
		}).catch((error) => {
			logger.error(error);
		});
	} else {
		await db.organization.update({
			where: { id: organizationId },
			data: {
				subscription: {
					create: {
						paddleSubscriptionId,
						paddlePlanId: planId,
						paddleCheckoutId,
						nextBillDate,
						status,
						lastEventTime,
						updateUrl,
						cancelUrl,
						currency,
						unitPrice,
					},
				},
			},
		});

		sendEmail({
			subject: "Welcome to Shellphone",
			body: `Welcome to Shellphone`,
			recipients: [email],
		}).catch((error) => {
			logger.error(error);
		});
	}
});

export default subscriptionCreatedQueue;
