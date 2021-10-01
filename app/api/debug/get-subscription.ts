import type { BlitzApiHandler } from "blitz";

import db from "db";
import appLogger from "integrations/logger";

const logger = appLogger.child({ route: "/api/debug/get-subscription" });

const cancelSubscriptionHandler: BlitzApiHandler = async (req, res) => {
	const { organizationId } = req.body;

	logger.debug(`fetching subscription for organizationId="${organizationId}"`);
	const subscription = await db.subscription.findFirst({ where: { organizationId } });
	console.debug(subscription);

	res.status(200).send(subscription);
};

export default cancelSubscriptionHandler;
