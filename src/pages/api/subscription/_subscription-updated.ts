import type { NextApiRequest, NextApiResponse } from "next";
import Joi from "joi";

import type { ApiError } from "../_types";
import type { SubscriptionStatus } from "../../../database/subscriptions";
import {
	findSubscription,
	SUBSCRIPTION_STATUSES,
	updateSubscription,
} from "../../../database/subscriptions";
import { PLANS } from "../../../subscription/plans";
import appLogger from "../../../../lib/logger";
import { sendEmail } from "../_send-email";
import { findCustomer } from "../../../database/customer";

const logger = appLogger.child({ module: "subscription-updated" });

const bodySchema = Joi.object<Body>({
	update_url: Joi.string().required(),
	status: Joi.string()
		.allow(...SUBSCRIPTION_STATUSES)
		.required(),
	subscription_id: Joi.string().required(),
	event_time: Joi.string().required(),
});

export async function subscriptionUpdated(
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

	const status = body.status;
	const updateUrl = body.update_url;
	const cancelUrl = body.cancel_url;
	const planId = body.subscription_plan_id;
	const nextPlan = PLANS[planId];
	await updateSubscription({
		paddleSubscriptionId,
		planId,
		status,
		lastEventTime,
		updateUrl,
		cancelUrl,
	});

	const user = await findCustomer(subscription.userId);

	sendEmail({
		subject: "Thanks for your purchase",
		body: `Welcome to ${nextPlan.name} plan`,
		recipients: [user.email],
	}).catch((error) => {
		logger.error(error, "/api/subscription/webhook");
	});

	return res.status(200).end();
}

type Body = {
	alert_id: string;
	alert_name: string;
	cancel_url: string;
	checkout_id: string;
	currency: string;
	email: string;
	event_time: string;
	linked_subscriptions: string;
	marketing_consent: string;
	new_price: string;
	new_quantity: string;
	new_unit_price: string;
	next_bill_date: string;
	old_next_bill_date: string;
	old_price: string;
	old_quantity: string;
	old_status: string;
	old_subscription_plan_id: string;
	old_unit_price: string;
	passthrough: string;
	status: SubscriptionStatus;
	subscription_id: string;
	subscription_plan_id: string;
	update_url: string;
	user_id: string;
	p_signature: string;
};
