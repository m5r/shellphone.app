import type { BlitzApiHandler } from "blitz";

import { cancelPaddleSubscription } from "integrations/paddle";
import appLogger from "integrations/logger";

const logger = appLogger.child({ route: "/api/debug/cancel-subscription" });

const cancelSubscriptionHandler: BlitzApiHandler = async (req, res) => {
	const { subscriptionId } = req.body;

	logger.debug(`cancelling subscription for subscriptionId="${subscriptionId}"`);
	await cancelPaddleSubscription({ subscriptionId });
	logger.debug(`cancelled subscription for subscriptionId="${subscriptionId}"`);

	res.status(200).end();
};

export default cancelSubscriptionHandler;
