import { NotFoundError, resolver } from "blitz";
import { z } from "zod";

import db from "db";
import { updateSubscriptionPlan } from "integrations/paddle";

const Body = z.object({
	planId: z.number(),
});

export default resolver.pipe(resolver.zod(Body), resolver.authorize(), async ({ planId }, ctx) => {
	const subscription = await db.subscription.findFirst({ where: { organizationId: ctx.session.orgId } });
	if (!subscription) {
		throw new NotFoundError();
	}

	const subscriptionId = subscription.paddleSubscriptionId;
	const result = await updateSubscriptionPlan({ planId, subscriptionId });
	console.log("result", result);
});
