import { Queue } from "quirrel/blitz";

import db, { MembershipRole } from "../../../../db";
import appLogger from "../../../../integrations/logger";

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
						include: { memberships: { include: { user: true } } },
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
			const where = { organizationId: organization.id };
			await Promise.all<unknown>([
				db.notificationSubscription.deleteMany({ where }),
				db.phoneCall.deleteMany({ where }),
				db.message.deleteMany({ where }),
				db.processingPhoneNumber.deleteMany({ where }),
			]);
			await db.phoneNumber.deleteMany({ where });

			const orgMembers = organization.memberships
				.map((membership) => membership.user!)
				.filter((user) => user !== null);
			await Promise.all(
				orgMembers.map((member) =>
					Promise.all([
						db.token.deleteMany({ where: { userId: member.id } }),
						db.session.deleteMany({ where: { userId: member.id } }),
						db.membership.deleteMany({ where: { userId: member.id } }),
						db.user.delete({ where: { id: member.id } }),
					]),
				),
			);
			await db.organization.delete({ where: { id: organization.id } });
			break;
		}
		case MembershipRole.USER: {
			await Promise.all([
				db.token.deleteMany({ where: { userId: user.id } }),
				db.session.deleteMany({ where: { userId: user.id } }),
				db.user.delete({ where: { id: user.id } }),
				db.membership.deleteMany({ where: { userId: user.id } }),
			]);
			break;
		}
		case MembershipRole.ADMIN:
			// nothing to do here?
			break;
	}
});

export default deleteUserData;
