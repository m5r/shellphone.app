import { resolver } from "blitz";
import { z } from "zod";

import db from "../../../db";
import appLogger from "../../../integrations/logger";

const logger = appLogger.child({ mutation: "set-notification-subscription" });

const Body = z.object({
	subscription: z.object({
		endpoint: z.string(),
		expirationTime: z.number().nullable(),
		keys: z.object({
			p256dh: z.string(),
			auth: z.string(),
		}),
	}),
});

export default resolver.pipe(resolver.zod(Body), resolver.authorize(), async ({ subscription }, context) => {
	const customerId = context.session.userId;
	try {
		await db.notificationSubscription.create({
			data: {
				customerId,
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
});
