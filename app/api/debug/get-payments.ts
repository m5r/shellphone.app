import type { BlitzApiHandler } from "blitz";

import { getPayments } from "integrations/paddle";
import appLogger from "integrations/logger";
import db from "db";

const logger = appLogger.child({ route: "/api/debug/cancel-subscription" });

const cancelSubscriptionHandler: BlitzApiHandler = async (req, res) => {
	const { organizationId } = req.body;

	logger.debug(`fetching payments for organizationId="${organizationId}"`);
	const subscriptions = await db.subscription.findMany({ where: { organizationId } });
	if (subscriptions.length === 0) {
		res.status(200).send([]);
	}
	console.log("subscriptions", subscriptions);

	const paymentsBySubscription = await Promise.all(
		subscriptions.map((subscription) => getPayments({ subscriptionId: subscription.paddleSubscriptionId })),
	);
	const payments = paymentsBySubscription.flat();
	const result = Array.from(payments).sort((a, b) => b.payout_date.localeCompare(a.payout_date));
	logger.debug(result);

	res.status(200).send(result);
};

export default cancelSubscriptionHandler;
