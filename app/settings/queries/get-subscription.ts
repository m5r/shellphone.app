import { resolver } from "blitz";

import db, { Prisma, SubscriptionStatus } from "db";

export default resolver.pipe(resolver.authorize(), async (_ = null, { session }) => {
	if (!session.orgId) return null;

	return db.subscription.findFirst({
		where: {
			organizationId: session.orgId,
			OR: [
				{ status: { not: SubscriptionStatus.deleted } },
				{
					status: SubscriptionStatus.deleted,
					cancellationEffectiveDate: { gt: new Date() },
				},
			],
		},
		orderBy: { lastEventTime: Prisma.SortOrder.desc },
	});
});
