import { resolver } from "blitz";
import { z } from "zod";
import db, { Prisma } from "db";

const Body = z.object({
	phoneNumberId: z.string(),
});

export default resolver.pipe(resolver.zod(Body), resolver.authorize(), async ({ phoneNumberId }, context) => {
	const organizationId = context.session.orgId;

	return db.phoneCall.findMany({
		where: { organizationId, phoneNumberId },
		orderBy: { createdAt: Prisma.SortOrder.asc },
	});
});
