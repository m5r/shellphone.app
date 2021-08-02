import { resolver } from "blitz";
import { z } from "zod";

import db from "../../../db";
import getCurrentCustomer from "../../customers/queries/get-current-customer";

const Body = z.object({
	twilioAccountSid: z.string(),
	twilioAuthToken: z.string(),
});

export default resolver.pipe(
	resolver.zod(Body),
	resolver.authorize(),
	async ({ twilioAccountSid, twilioAuthToken }, context) => {
		const customer = await getCurrentCustomer(null, context);
		if (!customer) {
			return;
		}

		await db.customer.update({
			where: { id: customer.id },
			data: {
				accountSid: twilioAccountSid,
				authToken: twilioAuthToken,
			},
		});
	},
);
