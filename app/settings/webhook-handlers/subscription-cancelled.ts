import type { BlitzApiHandler } from "blitz";
import { NotFoundError } from "blitz";
import { z } from "zod";

import type { ApiError } from "../../core/types";
import db from "db";
import appLogger from "../../../integrations/logger";

const logger = appLogger.child({ module: "subscription-cancelled" });

export const subscriptionCancelled: BlitzApiHandler = async (req, res) => {
	const validationResult = bodySchema.safeParse(req.body);
	if (!validationResult.success) {
		const statusCode = 400;
		const apiError: ApiError = {
			statusCode,
			errorMessage: "Body is malformed",
		};
		logger.error(validationResult.error, "/api/subscription/webhook");

		res.status(statusCode).send(apiError);
		return;
	}

	const body = validationResult.data;
	const paddleSubscriptionId = body.subscription_id;
	const subscription = await db.subscription.findFirst({ where: { paddleSubscriptionId } });
	if (!subscription) {
		throw new NotFoundError();
	}

	const lastEventTime = new Date(body.event_time);
	const isEventOlderThanLastUpdate = subscription.lastEventTime > lastEventTime;
	if (isEventOlderThanLastUpdate) {
		res.status(200).end();
		return;
	}

	const paddleCheckoutId = body.checkout_id;
	const planId = body.subscription_plan_id;
	const status = body.status;
	const currency = body.currency;
	const unitPrice = body.unit_price;

	await db.subscription.update({
		where: { paddleSubscriptionId },
		data: {
			paddleSubscriptionId,
			paddlePlanId: planId,
			paddleCheckoutId,
			status,
			lastEventTime,
			currency,
			unitPrice,
		},
	});

	return res.status(200).end();
};

const bodySchema = z.object({
	alert_id: z.string(),
	alert_name: z.string(),
	cancellation_effective_date: z.string(),
	checkout_id: z.string(),
	currency: z.string(),
	email: z.string(),
	event_time: z.string(),
	linked_subscriptions: z.string(),
	marketing_consent: z.string(),
	passthrough: z.string(),
	quantity: z.string(),
	status: z.enum(["active", "trialing", "past_due", "paused", "deleted"]),
	subscription_id: z.string(),
	subscription_plan_id: z.string(),
	unit_price: z.string(),
	user_id: z.string(),
	p_signature: z.string(),
});
