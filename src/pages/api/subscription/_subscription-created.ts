import type { NextApiRequest, NextApiResponse } from "next";
import Joi from "joi";

import type { SubscriptionStatus } from "../../../database/subscriptions";
import {
	createSubscription,
	findUserSubscription,
	updateSubscription,
	SUBSCRIPTION_STATUSES,
} from "../../../database/subscriptions";
import { sendEmail } from "../_send-email";
import type { ApiError } from "../_types";
import appLogger from "../../../../lib/logger";
import { PLANS } from "../../../subscription/plans";

const logger = appLogger.child({ module: "subscription-created" });

const bodySchema = Joi.object<Body>({
	checkout_id: Joi.string().required(),
	email: Joi.string().required(),
	event_time: Joi.string().required(),
	next_bill_date: Joi.string().required(),
	passthrough: Joi.string().required(),
	status: Joi.string()
		.allow(...SUBSCRIPTION_STATUSES)
		.required(),
	subscription_id: Joi.string().required(),
	subscription_plan_id: Joi.string().required(),
});

export async function subscriptionCreatedHandler(
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
	const paddleCheckoutId = body.checkout_id;
	const paddleSubscriptionId = body.subscription_id;
	const planId = body.subscription_plan_id;
	const { userId } = JSON.parse(body.passthrough);
	const email = body.email;
	const nextBillDate = new Date(body.next_bill_date);
	const status = body.status;
	const lastEventTime = new Date(body.event_time);
	const updateUrl = body.update_url;
	const cancelUrl = body.cancel_url;

	const subscription = await findUserSubscription({ userId });
	const teamHasSubscription = Boolean(subscription);
	if (teamHasSubscription) {
		await updateSubscription({
			paddleCheckoutId,
			paddleSubscriptionId,
			planId,
			nextBillDate,
			status,
			lastEventTime,
			updateUrl,
			cancelUrl,
		});

		sendEmail({
			subject: "Thanks for coming back",
			body: "Thanks for coming back",
			recipients: [email],
		}).catch((error) => {
			logger.error(error, "/api/subscription/webhook");
		});
	} else {
		await createSubscription({
			paddleCheckoutId,
			paddleSubscriptionId,
			userId,
			planId,
			nextBillDate,
			status,
			lastEventTime,
			updateUrl,
			cancelUrl,
		});

		const nextPlan = PLANS[planId];
		sendEmail({
			subject: "Thanks for your purchase",
			body: `Welcome to ${nextPlan.name} plan`,
			recipients: [email],
		}).catch((error) => {
			logger.error(error, "/api/subscription/webhook");
		});
	}

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
	next_bill_date: string;
	passthrough: string;
	quantity: string;
	source: string;
	status: SubscriptionStatus;
	subscription_id: string;
	subscription_plan_id: string;
	unit_price: string;
	update_url: string;
	user_id: string;
	p_signature: string;
};
