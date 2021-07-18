import type { NextApiRequest, NextApiResponse } from "next";
import Joi from "joi";

import type { ApiError } from "../_types";
import type { SubscriptionStatus } from "../../../database/subscriptions";
import {
	findSubscription,
	SUBSCRIPTION_STATUSES,
	updateSubscription,
} from "../../../database/subscriptions";
import appLogger from "../../../../lib/logger";

const logger = appLogger.child({ module: "subscription-cancelled" });

const bodySchema = Joi.object<Body>({
	event_time: Joi.string().required(),
	status: Joi.string()
		.allow(...SUBSCRIPTION_STATUSES)
		.required(),
	subscription_id: Joi.string().required(),
});

export async function subscriptionCancelled(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const validationResult = bodySchema.validate(req.body, {
		allowUnknown: true,
	});
	const validationError = validationResult.error;
	if (validationError) {
		const statusCode = 400;
		const apiError: ApiError = {
			statusCode,
			errorMessage: "Body is malformed",
		};
		logger.error(validationError, "/api/subscription/webhook");

		res.status(statusCode).send(apiError);
		return;
	}

	const body: Body = validationResult.value;
	const paddleSubscriptionId = body.subscription_id;
	const subscription = await findSubscription({ paddleSubscriptionId });
	if (!subscription) {
		const errorMessage = `Subscription with id ${paddleSubscriptionId} not found`;
		const statusCode = 404;
		const apiError: ApiError = {
			statusCode,
			errorMessage,
		};
		logger.error(errorMessage, "/api/subscription/webhook");

		res.status(statusCode).send(apiError);
		return;
	}

	const lastEventTime = new Date(body.event_time);
	if (subscription.lastEventTime > lastEventTime) {
		res.status(200).end();
		return;
	}

	await updateSubscription({
		paddleSubscriptionId,
		status: body.status,
		lastEventTime,
	});

	return res.status(200).end();
}

type Body = {
	alert_id: string;
	alert_name: string;
	cancellation_effective_date: string;
	checkout_id: string;
	currency: string;
	email: string;
	event_time: string;
	linked_subscriptions: string;
	marketing_consent: string;
	passthrough: string;
	quantity: string;
	status: SubscriptionStatus;
	subscription_id: string;
	subscription_plan_id: string;
	unit_price: string;
	user_id: string;
	p_signature: string;
};
