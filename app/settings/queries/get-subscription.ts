import { resolver } from "blitz";

import db from "db";

export default resolver.pipe(resolver.authorize(), async (_ = null, { session }) => {
	if (!session.orgId) return null;

	return db.subscription.findFirst({ where: { organizationId: session.orgId } });
});
