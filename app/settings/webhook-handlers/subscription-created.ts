import type { BlitzApiHandler } from "blitz";
import { NotFoundError } from "blitz";
import { z } from "zod";

import type { ApiError } from "../../core/types";
import db, { MembershipRole } from "db";
import appLogger from "../../../integrations/logger";
import { sendEmail } from "../../../integrations/ses";

const logger = appLogger.child({ module: "subscription-created" });

export const subscriptionCreatedHandler: BlitzApiHandler = async (req, res) => {
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
	const { organizationId } = JSON.parse(body.passthrough);
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
	const paddleCheckoutId = body.checkout_id;
	const paddleSubscriptionId = body.subscription_id;
	const planId = body.subscription_plan_id;
	const nextBillDate = new Date(body.next_bill_date);
	const status = body.status;
	const lastEventTime = new Date(body.event_time);
	const updateUrl = body.update_url;
	const cancelUrl = body.cancel_url;
	const currency = body.currency;
	const unitPrice = body.unit_price;

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
			logger.error(error, "/api/subscription/webhook");
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
			logger.error(error, "/api/webhook/subscription");
		});
	}

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
	next_bill_date: z.string(),
	passthrough: z.string(),
	quantity: z.string(),
	source: z.string(),
	status: z.enum(["active", "trialing", "past_due", "paused", "deleted"]),
	subscription_id: z.string(),
	subscription_plan_id: z.string(),
	unit_price: z.string(),
	update_url: z.string(),
	user_id: z.string(),
	p_signature: z.string(),
});
