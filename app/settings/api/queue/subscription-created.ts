import { NotFoundError } from "blitz";
import { Queue } from "quirrel/blitz";
import type { PaddleSdkSubscriptionCreatedEvent } from "@devoxa/paddle-sdk";

import db, { MembershipRole } from "db";
import appLogger from "integrations/logger";
import { sendEmail } from "integrations/aws-ses";
import type { Metadata } from "integrations/paddle";
import { translateSubscriptionStatus } from "integrations/paddle";
import fetchMessagesQueue from "app/messages/api/queue/fetch-messages";
import fetchCallsQueue from "app/phone-calls/api/queue/fetch-calls";

const logger = appLogger.child({ queue: "subscription-created" });

type Payload = {
	event: PaddleSdkSubscriptionCreatedEvent<Metadata>;
};

export const subscriptionCreatedQueue = Queue<Payload>("api/queue/subscription-created", async ({ event }) => {
	const { organizationId } = event.metadata;
	const organization = await db.organization.findFirst({
		where: { id: organizationId },
		include: {
			phoneNumbers: true,
			subscriptions: true,
			memberships: {
				include: { user: true },
			},
		},
	});
	if (!organization) {
		throw new NotFoundError();
	}

	const isReturningSubscriber = organization.subscriptions.length > 0;
	const orgOwner = organization.memberships.find((membership) => membership.role === MembershipRole.OWNER);
	const email = orgOwner!.user!.email;
	await db.subscription.create({
		data: {
			organizationId,
			paddleSubscriptionId: event.subscriptionId,
			paddlePlanId: event.productId,
			paddleCheckoutId: event.checkoutId,
			nextBillDate: event.nextPaymentDate,
			status: translateSubscriptionStatus(event.status),
			lastEventTime: event.eventTime,
			updateUrl: event.updateUrl,
			cancelUrl: event.cancelUrl,
			currency: event.currency,
			unitPrice: event.unitPrice,
		},
	});

	// fetch dismissed messages and phone calls that might have happened while on free plan
	const phoneNumber = organization.phoneNumbers[0];
	if (phoneNumber) {
		const phoneNumberId = phoneNumber.id;
		await Promise.all([
			db.processingPhoneNumber.create({
				data: {
					organizationId,
					phoneNumberId,
					hasFetchedMessages: false,
					hasFetchedCalls: false,
				},
			}),
			fetchMessagesQueue.enqueue(
				{ organizationId, phoneNumberId },
				{ id: `fetch-messages-${organizationId}-${phoneNumberId}` },
			),
			fetchCallsQueue.enqueue(
				{ organizationId, phoneNumberId },
				{ id: `fetch-messages-${organizationId}-${phoneNumberId}` },
			),
		]);
	}

	if (isReturningSubscriber) {
		sendEmail({
			subject: "Welcome back to Shellphone",
			body: "Welcome back to Shellphone",
			recipients: [email],
		}).catch((error) => {
			logger.error(error);
		});

		return;
	}

	sendEmail({
		subject: "Welcome to Shellphone",
		body: `Welcome to Shellphone`,
		recipients: [email],
	}).catch((error) => {
		logger.error(error);
	});
});

export default subscriptionCreatedQueue;
