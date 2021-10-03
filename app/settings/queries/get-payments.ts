import { paginate, resolver } from "blitz";
import { z } from "zod";

import db from "db";
import { getPayments } from "integrations/paddle";

const Body = z.object({
	skip: z.number().optional(),
	take: z.number().optional(),
});

export default resolver.pipe(resolver.zod(Body), resolver.authorize(), async ({ skip, take }, { session }) => {
	if (!session.orgId) {
		return {
			payments: [],
			nextPage: null,
			hasMore: false,
			count: 0,
		};
	}

	const subscriptions = await db.subscription.findMany({ where: { organizationId: session.orgId } });
	if (subscriptions.length === 0) {
		return {
			payments: [],
			nextPage: null,
			hasMore: false,
			count: 0,
		};
	}

	const paymentsBySubscription = await Promise.all(
		subscriptions.map((subscription) => getPayments({ subscriptionId: subscription.paddleSubscriptionId })),
	);
	const unsortedPayments = paymentsBySubscription.flat();
	const allPayments = Array.from(unsortedPayments).sort((a, b) => b.payout_date.localeCompare(a.payout_date));

	const {
		items: payments,
		hasMore,
		nextPage,
		count,
	} = await paginate({
		skip,
		take,
		count: () => Promise.resolve(allPayments.length),
		query: ({ skip, take }) => Promise.resolve(allPayments.slice(skip, skip + take)),
	});

	return {
		payments,
		nextPage,
		hasMore,
		count,
	};
});
