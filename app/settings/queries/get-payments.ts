import { resolver } from "blitz";

import db, { SubscriptionStatus } from "db";
import { getPayments } from "integrations/paddle";

export default resolver.pipe(resolver.authorize(), async (_ = null, { session }) => {
	if (!session.orgId) {
		return [];
	}

	const subscription = await db.subscription.findFirst({
		where: { organizationId: session.orgId, status: SubscriptionStatus.active },
	});
	if (!subscription) {
		return [];
	}

	const payments = await getPayments({ subscriptionId: subscription.paddleSubscriptionId });
	return payments.sort((a, b) => b.payout_date.localeCompare(a.payout_date));
});
