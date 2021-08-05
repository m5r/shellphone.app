import { resolver } from "blitz";
import { z } from "zod";

import db from "../../../db";
import appLogger from "../../../integrations/logger";
import { enforceSuperAdminIfNotCurrentOrganization, setDefaultOrganizationId } from "../utils";

const logger = appLogger.child({ mutation: "set-notification-subscription" });

const Body = z.object({
	organizationId: z.string().optional(),
	phoneNumberId: z.string(),
	subscription: z.object({
		endpoint: z.string(),
		expirationTime: z.number().nullable(),
		keys: z.object({
			p256dh: z.string(),
			auth: z.string(),
		}),
	}),
});

export default resolver.pipe(
	resolver.zod(Body),
	resolver.authorize(),
	setDefaultOrganizationId,
	enforceSuperAdminIfNotCurrentOrganization,
	async ({ organizationId, phoneNumberId, subscription }) => {
		const phoneNumber = await db.phoneNumber.findFirst({
			where: { id: phoneNumberId, organizationId },
			include: { organization: true },
		});
		if (!phoneNumber) {
			return;
		}

		try {
			await db.notificationSubscription.create({
				data: {
					organizationId,
					phoneNumberId,
					endpoint: subscription.endpoint,
					expirationTime: subscription.expirationTime,
					keys_p256dh: subscription.keys.p256dh,
					keys_auth: subscription.keys.auth,
				},
			});
		} catch (error) {
			if (error.code !== "P2002") {
				logger.error(error);
				// we might want to `throw error`;
			}
		}
	},
);
