import { Queue } from "quirrel/blitz";

import db, { MembershipRole, SubscriptionStatus } from "../../../../db";
import appLogger from "../../../../integrations/logger";
import { cancelPaddleSubscription } from "../../../../integrations/paddle";

const logger = appLogger.child({ queue: "delete-user-data" });

type Payload = {
	userId: string;
};

const deleteUserData = Queue<Payload>("api/queue/delete-user-data", async ({ userId }) => {
	const user = await db.user.findFirst({
		where: { id: userId },
		include: {
			memberships: {
				include: {
					organization: {
						include: {
							subscriptions: {
								where: { status: { not: SubscriptionStatus.deleted } },
							},
						},
					},
				},
			},
		},
	});
	if (!user) {
		return;
	}

	switch (user.memberships[0]!.role) {
		case MembershipRole.OWNER: {
			const organization = user.memberships[0]!.organization;
			await db.organization.delete({ where: { id: organization.id } });
			await db.user.delete({ where: { id: user.id } });

			if (organization.subscriptions.length > 0) {
				await Promise.all(
					organization.subscriptions.map((subscription) =>
						cancelPaddleSubscription({ subscriptionId: subscription.paddleSubscriptionId }),
					),
				);
			}

			break;
		}
		case MembershipRole.USER: {
			await db.user.delete({ where: { id: user.id } });
			break;
		}
		case MembershipRole.ADMIN:
			// nothing to do here?
			break;
	}
});

export default deleteUserData;
