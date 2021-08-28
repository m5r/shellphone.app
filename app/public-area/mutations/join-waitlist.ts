import { resolver } from "blitz";
import { z } from "zod";

import appLogger from "../../../integrations/logger";
import { addSubscriber } from "../../../integrations/mailchimp";

const logger = appLogger.child({ mutation: "join-waitlist" });

const bodySchema = z.object({
	email: z.string().email(),
});

export default resolver.pipe(resolver.zod(bodySchema), async ({ email }, ctx) => {
	try {
		await addSubscriber(email);
	} catch (error: any) {
		logger.error(error.response?.data);

		if (error.response?.data.title !== "Member Exists") {
			throw error;
		}
	}
});
