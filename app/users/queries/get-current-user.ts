import type { Ctx } from "blitz";

import db, { Prisma, SubscriptionStatus } from "db";

export default async function getCurrentUser(_ = null, { session }: Ctx) {
	if (!session.userId) return null;

	return db.user.findFirst({
		where: { id: session.userId },
		select: {
			id: true,
			fullName: true,
			email: true,
			role: true,
			memberships: {
				include: {
					organization: {
						include: {
							subscriptions: {
								where: {
									OR: [
										{ status: { not: SubscriptionStatus.deleted } },
										{
											status: SubscriptionStatus.deleted,
											cancellationEffectiveDate: { gt: new Date() },
										},
									],
								},
								orderBy: { lastEventTime: Prisma.SortOrder.desc },
							},
						},
					},
				},
			},
		},
	});
}
