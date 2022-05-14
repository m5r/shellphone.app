import type { Organization } from "@prisma/client";

import db from "~/utils/db.server";

export async function deleteOrganizationEntities(organization: Organization) {
	// await cancelSubscription(organization.stripeSubscriptionId);

	// delete user accounts who were only in this one organization
	await db.user.deleteMany({
		where: {
			memberships: {
				every: { organizationId: organization.id },
			},
		},
	});

	await db.membership.deleteMany({
		where: {
			organizationId: organization.id,
		},
	});

	await db.organization.delete({ where: { id: organization.id } });
}
