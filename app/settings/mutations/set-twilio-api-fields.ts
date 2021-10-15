import { resolver } from "blitz";
import { z } from "zod";

import db from "db";
import getCurrentUser from "app/users/queries/get-current-user";

const Body = z.object({
	twilioAccountSid: z.string(),
	twilioAuthToken: z.string(),
});

export default resolver.pipe(
	resolver.zod(Body),
	resolver.authorize(),
	async ({ twilioAccountSid, twilioAuthToken }, context) => {
		const user = await getCurrentUser(null, context);
		if (!user) {
			return;
		}

		const organizationId = user.memberships[0]!.organizationId;
		await db.organization.update({
			where: { id: organizationId },
			data: {
				twilioAccountSid: twilioAccountSid,
				twilioAuthToken: twilioAuthToken,
			},
		});

		const phoneNumber = await db.phoneNumber.findFirst({ where: { organizationId } });
		if (phoneNumber) {
			await db.phoneNumber.delete({
				where: {
					organizationId_id: {
						organizationId,
						id: phoneNumber.id,
					},
				},
			});
		}
	},
);
