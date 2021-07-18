import type { NextApiRequest, NextApiResponse } from "next";

import type { SubscriptionStatus } from "../../../database/subscriptions";
import {
	findSubscription,
	updateSubscription,
} from "../../../database/subscriptions";
import type { ApiError } from "../_types";
import appLogger from "../../../../lib/logger";

const logger = appLogger.child({ module: "subscription-payment-succeeded" });

export async function subscriptionPaymentSucceededHandler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const body: Body = req.body;

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
	const nextBillDate = new Date(body.next_bill_date);

	await updateSubscription({
		paddleSubscriptionId,
		status,
		lastEventTime,
		nextBillDate,
	});

	return res.status(200).end();
}

type Body = {
	alert_id: string;
	alert_name: string;
	balance_currency: string;
	balance_earnings: string;
	balance_fee: string;
	balance_gross: string;
	balance_tax: string;
	checkout_id: string;
	country: string;
	coupon: string;
	currency: string;
	customer_name: string;
	earnings: string;
	email: string;
	event_time: string;
	fee: string;
	initial_payment: string;
	instalments: string;
	marketing_consent: string;
	next_bill_date: string;
	next_payment_amount: string;
	order_id: string;
	passthrough: string;
	payment_method: string;
	payment_tax: string;
	plan_name: string;
	quantity: string;
	receipt_url: string;
	sale_gross: string;
	status: SubscriptionStatus;
	subscription_id: string;
	subscription_payment_id: string;
	subscription_plan_id: string;
	unit_price: string;
	user_id: string;
	p_signature: string;
};
