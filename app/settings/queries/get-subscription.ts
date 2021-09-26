import type { Ctx } from "blitz";

import db from "db";

export default async function getCurrentUser(_ = null, { session }: Ctx) {
	if (!session.orgId) return null;

	return db.subscription.findFirst({ where: { organizationId: session.orgId } });
}
