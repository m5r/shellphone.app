import type { BlitzApiHandler } from "blitz";
import { NotFoundError } from "blitz";
import { z } from "zod";

import type { ApiError } from "../../core/types";
import db, { MembershipRole } from "db";
import appLogger from "../../../integrations/logger";
import { sendEmail } from "../../../integrations/ses";

const logger = appLogger.child({ module: "subscription-updated" });

export const subscriptionUpdated: BlitzApiHandler = async (req, res) => {
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

	const lastEventTime = new Date(body.event_time);
	const isEventOlderThanLastUpdate = subscription.lastEventTime > lastEventTime;
	if (isEventOlderThanLastUpdate) {
		res.status(200).end();
		return;
	}

	const orgOwner = subscription.organization!.memberships.find(
		(membership) => membership.role === MembershipRole.OWNER,
	);
	const email = orgOwner!.user!.email;
	const paddleCheckoutId = body.checkout_id;
	const planId = body.subscription_plan_id;
	const nextBillDate = new Date(body.next_bill_date);
	const status = body.status;
	const updateUrl = body.update_url;
	const cancelUrl = body.cancel_url;
	const currency = body.currency;
	const unitPrice = body.new_unit_price;

	await db.subscription.update({
		where: { paddleSubscriptionId },
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
		subject: "Thanks for your purchase",
		body: "Thanks for your purchase",
		recipients: [email],
	}).catch((error) => {
		logger.error(error, "/api/subscription/webhook");
	});

	return res.status(200).end();
};

const bodySchema = z.object({
	alert_id: z.string(),
	alert_name: z.string(),
	cancel_url: z.string(),
	checkout_id: z.string(),
	currency: z.string(),
	email: z.string(),
	event_time: z.string(),
	linked_subscriptions: z.string(),
	marketing_consent: z.string(),
	new_price: z.string(),
	new_quantity: z.string(),
	new_unit_price: z.string(),
	next_bill_date: z.string(),
	old_next_bill_date: z.string(),
	old_price: z.string(),
	old_quantity: z.string(),
	old_status: z.string(),
	old_subscription_plan_id: z.string(),
	old_unit_price: z.string(),
	passthrough: z.string(),
	status: z.enum(["active", "trialing", "past_due", "paused", "deleted"]),
	subscription_id: z.string(),
	subscription_plan_id: z.string(),
	update_url: z.string(),
	user_id: z.string(),
	p_signature: z.string(),
});
