import type { BlitzApiHandler } from "blitz";
import { NotFoundError } from "blitz";
import { z } from "zod";

import type { ApiError } from "../../core/types";
import db from "db";
import appLogger from "../../../integrations/logger";

const logger = appLogger.child({ module: "subscription-payment-succeeded" });

export const subscriptionPaymentSucceededHandler: BlitzApiHandler = async (req, res) => {
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
	const nextBillDate = new Date(body.next_bill_date);
	const status = body.status;
	const currency = body.currency;
	const unitPrice = body.unit_price;

	await db.subscription.update({
		where: { paddleSubscriptionId },
		data: {
			paddleSubscriptionId,
			paddlePlanId: planId,
			paddleCheckoutId,
			nextBillDate,
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
	balance_currency: z.string(),
	balance_earnings: z.string(),
	balance_fee: z.string(),
	balance_gross: z.string(),
	balance_tax: z.string(),
	checkout_id: z.string(),
	country: z.string(),
	coupon: z.string(),
	currency: z.string(),
	customer_name: z.string(),
	earnings: z.string(),
	email: z.string(),
	event_time: z.string(),
	fee: z.string(),
	initial_payment: z.string(),
	instalments: z.string(),
	marketing_consent: z.string(),
	next_bill_date: z.string(),
	next_payment_amount: z.string(),
	order_id: z.string(),
	passthrough: z.string(),
	payment_method: z.string(),
	payment_tax: z.string(),
	plan_name: z.string(),
	quantity: z.string(),
	receipt_url: z.string(),
	sale_gross: z.string(),
	status: z.enum(["active", "trialing", "past_due", "paused", "deleted"]),
	subscription_id: z.string(),
	subscription_payment_id: z.string(),
	subscription_plan_id: z.string(),
	unit_price: z.string(),
	user_id: z.string(),
	p_signature: z.string(),
});
