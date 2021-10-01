import { resolver } from "blitz";

import db from "db";
import { getPayments } from "integrations/paddle";

export default resolver.pipe(resolver.authorize(), async (_ = null, { session }) => {
	if (!session.orgId) {
		return [];
	}

	const subscriptions = await db.subscription.findMany({ where: { organizationId: session.orgId } });
	if (subscriptions.length === 0) {
		return [];
	}

	const paymentsBySubscription = await Promise.all(
		subscriptions.map((subscription) => getPayments({ subscriptionId: subscription.paddleSubscriptionId })),
	);
	const payments = paymentsBySubscription.flat();
	return payments.sort((a, b) => b.payout_date.localeCompare(a.payout_date));
});
