import { MembershipRole } from "@prisma/client";

import { Queue } from "~/utils/queue.server";
import db from "~/utils/db.server";
import logger from "~/utils/logger.server";
import { deleteOrganizationEntities } from "~/utils/organization.server";

type Payload = {
	userId: string;
};

export default Queue<Payload>("delete user data", async ({ data }) => {
	const { userId } = data;
	const user = await db.user.findUnique({
		where: { id: userId },
		include: {
			memberships: {
				include: { organization: true },
			},
		},
	});
	if (!user) {
		return;
	}

	await Promise.all(
		user.memberships.map(async (membership) => {
			switch (membership.role) {
				case MembershipRole.OWNER: {
					await deleteOrganizationEntities(membership.organization);
					break;
				}
				case MembershipRole.USER: {
					await db.membership.delete({ where: { id: membership.id } });
					break;
				}
			}
		}),
	);

	try {
		await db.user.delete({ where: { id: user.id } });
	} catch (error: any) {
		if (error.code === "P2025") {
			logger.warn("Could not delete user because it has already been deleted");
			return;
		}

		throw error;
	}
});
