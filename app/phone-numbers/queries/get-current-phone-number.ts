import { resolver } from "blitz";
import { z } from "zod";

import db from "db";
import { enforceSuperAdminIfNotCurrentOrganization, setDefaultOrganizationId } from "../../core/utils";

export default resolver.pipe(
	resolver.zod(z.object({ organizationId: z.string().optional() })),
	resolver.authorize(),
	setDefaultOrganizationId,
	enforceSuperAdminIfNotCurrentOrganization,
	async ({ organizationId }) => {
		return db.phoneNumber.findFirst({
			where: { organizationId },
			select: {
				id: true,
				organizationId: true,
				number: true,
			},
		});
	},
);
