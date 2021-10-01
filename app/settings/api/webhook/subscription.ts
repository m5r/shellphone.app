import type { BlitzApiHandler } from "blitz";
import type { Queue } from "quirrel/blitz";
import type {
	PaddleSdkSubscriptionCancelledEvent,
	PaddleSdkSubscriptionCreatedEvent,
	PaddleSdkSubscriptionPaymentSucceededEvent,
	PaddleSdkSubscriptionUpdatedEvent,
} from "@devoxa/paddle-sdk";
import { PaddleSdkWebhookEventType } from "@devoxa/paddle-sdk";

import type { ApiError } from "app/core/types";
import subscriptionCreatedQueue from "../queue/subscription-created";
import subscriptionPaymentSucceededQueue from "../queue/subscription-payment-succeeded";
import subscriptionCancelledQueue from "../queue/subscription-cancelled";
import subscriptionUpdatedQueue from "../queue/subscription-updated";
import appLogger from "integrations/logger";
import { paddleSdk } from "integrations/paddle";

type Events<TMetadata = { organizationId: string }> =
	| PaddleSdkSubscriptionCreatedEvent<TMetadata>
	| PaddleSdkSubscriptionUpdatedEvent<TMetadata>
	| PaddleSdkSubscriptionCancelledEvent<TMetadata>
	| PaddleSdkSubscriptionPaymentSucceededEvent<TMetadata>;

type SupportedEventType = Events["eventType"];

const queues: Record<SupportedEventType, Queue<{ event: Events }>> = {
	[PaddleSdkWebhookEventType.SUBSCRIPTION_CREATED]: subscriptionCreatedQueue,
	[PaddleSdkWebhookEventType.SUBSCRIPTION_PAYMENT_SUCCEEDED]: subscriptionPaymentSucceededQueue,
	[PaddleSdkWebhookEventType.SUBSCRIPTION_CANCELLED]: subscriptionCancelledQueue,
	[PaddleSdkWebhookEventType.SUBSCRIPTION_UPDATED]: subscriptionUpdatedQueue,
};

const logger = appLogger.child({ route: "/api/subscription/webhook" });

const webhook: BlitzApiHandler = async (req, res) => {
	if (req.method !== "POST") {
		const statusCode = 405;
		const apiError: ApiError = {
			statusCode,
			errorMessage: `Method ${req.method} Not Allowed`,
		};
		logger.error(apiError);

		res.setHeader("Allow", ["POST"]);
		res.status(statusCode).send(apiError);
		return;
	}

	const event = paddleSdk.parseWebhookEvent(req.body);
	const alertName = event.eventType;
	logger.info(`Received ${alertName} webhook`);
	logger.info(event);
	if (isSupportedWebhook(alertName)) {
		await queues[alertName].enqueue({ event: event as Events }, { id: event.eventId.toString() });

		return res.status(200).end();
	}

	return res.status(400).end();
};

export default webhook;

function isSupportedWebhook(eventType: PaddleSdkWebhookEventType): eventType is SupportedEventType {
	return Object.keys(queues).includes(eventType);
}
