import { type ActionFunction } from "@remix-run/node";
import { badRequest, notFound } from "remix-utils";
import { z } from "zod";

import db from "~/utils/db.server";
import logger from "~/utils/logger.server";
import { validate } from "~/utils/validation.server";
import { requireLoggedIn } from "~/utils/auth.server";

const action: ActionFunction = async ({ request }) => {
	const formData = await request.clone().formData();
	const action = formData.get("_action");
	if (!action) {
		const errorMessage = "POST /notifications-subscription without any _action";
		logger.error(errorMessage);
		return badRequest({ errorMessage });
	}

	switch (action as Action) {
		case "subscribe":
			return subscribe(request);
		case "unsubscribe":
			return unsubscribe(request);
		default:
			const errorMessage = `POST /notifications-subscription with an invalid _action=${action}`;
			logger.error(errorMessage);
			return badRequest({ errorMessage });
	}
};

export default action;

async function subscribe(request: Request) {
	const { organization } = await requireLoggedIn(request);
	const formData = await request.formData();
	const body = {
		subscription: JSON.parse(formData.get("subscription")?.toString() ?? "{}"),
	};
	const validation = validate(validations.subscribe, body);
	if (validation.errors) {
		return badRequest(validation.errors);
	}

	const { subscription } = validation.data;
	const membership = await db.membership.findFirst({
		where: { id: organization.membershipId },
	});
	if (!membership) {
		return notFound("Phone number not found");
	}

	try {
		await db.notificationSubscription.create({
			data: {
				membershipId: membership.id,
				endpoint: subscription.endpoint,
				expirationTime: subscription.expirationTime,
				keys_p256dh: subscription.keys.p256dh,
				keys_auth: subscription.keys.auth,
			},
		});
	} catch (error: any) {
		if (error.code !== "P2002") {
			throw error;
		}

		logger.warn(`Duplicate insertion of subscription with endpoint=${subscription.endpoint}`);
	}

	return null;
}

async function unsubscribe(request: Request) {
	const formData = await request.formData();
	const body = {
		subscriptionEndpoint: formData.get("subscriptionEndpoint"),
	};
	const validation = validate(validations.unsubscribe, body);
	if (validation.errors) {
		return badRequest(validation.errors);
	}

	const endpoint = validation.data.subscriptionEndpoint;
	try {
		await db.notificationSubscription.delete({ where: { endpoint } });
	} catch (error: any) {
		if (error.code !== "P2025") {
			throw error;
		}

		logger.warn(`Could not delete subscription with endpoint=${endpoint} because it has already been deleted`);
	}

	return null;
}

type Action = "subscribe" | "unsubscribe";

const validations = {
	subscribe: z.object({
		subscription: z.object({
			endpoint: z.string(),
			expirationTime: z.number().nullable(),
			keys: z.object({
				p256dh: z.string(),
				auth: z.string(),
			}),
		}),
	}),
	unsubscribe: z.object({
		subscriptionEndpoint: z.string(),
	}),
} as const;
