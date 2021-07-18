import type { ApiError } from "../_types";
import { withApiAuthRequired } from "../../../../lib/session-helpers";
import appLogger from "../../../../lib/logger";
import { findUserSubscription } from "../../../database/subscriptions";
import Joi from "joi";
import {
	cancelPaddleSubscription,
	updateSubscriptionPlan,
} from "../../../subscription/_paddle-api";

type Body = {
	planId: string;
};
type Response = {} | ApiError;

const logger = appLogger.child({
	route: "/api/subscription/update-subscription",
});

const bodySchema = Joi.object<Body>({
	planId: Joi.string().required(),
});

export default withApiAuthRequired<Response>(async function updateSubscription(
	req,
	res,
	user,
) {
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

	const validationResult = bodySchema.validate(req.body, {
		stripUnknown: true,
	});
	const validationError = validationResult.error;
	if (validationError) {
		const statusCode = 400;
		const apiError: ApiError = {
			statusCode,
			errorMessage: "Body is malformed",
		};
		logger.error(validationError);

		res.status(statusCode).send(apiError);
		return;
	}
	const { planId }: Body = validationResult.value;

	const subscription = await findUserSubscription({
		userId: user.id,
	});
	if (!subscription) {
		const statusCode = 500;
		const apiError: ApiError = {
			statusCode,
			errorMessage: "You are not subscribed yet, this should not happen.",
		};
		logger.error(apiError);

		res.status(statusCode).send(apiError);
		return;
	}

	const subscriptionId = subscription.paddleSubscriptionId;
	const isMovingToFreePlan = planId === "free";
	if (isMovingToFreePlan) {
		await cancelPaddleSubscription({ subscriptionId });
		res.status(200).end();
		return;
	}

	await updateSubscriptionPlan({
		planId,
		subscriptionId,
	});

	res.status(200).end();
});
