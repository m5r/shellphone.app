import { NotFoundError, resolver } from "blitz";
import { z } from "zod";

import { updateSubscriptionPlan } from "../../../integrations/paddle";
import db from "../../../db";

const Body = z.object({
	planId: z.string(),
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
