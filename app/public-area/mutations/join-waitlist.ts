import { resolver } from "blitz";
import { z } from "zod";

import appLogger from "../../../integrations/logger";
import { addSubscriber } from "../../../integrations/mailchimp";
import { executeWebhook } from "../../../integrations/discord";

const logger = appLogger.child({ mutation: "join-waitlist" });

const bodySchema = z.object({
	email: z.string().email(),
});

export default resolver.pipe(resolver.zod(bodySchema), async ({ email }) => {
	try {
		await addSubscriber(email);
		await executeWebhook({
			id: "881915196245950485",
			token: "woZmauH3x-qY0mzIn--66NsrAFCJFvFaYrKDCMgfemVQBzdm86GhiowMOnZ_PezXtSV4",
			content: `\`${email}\` just joined Shellphone's waitlist`,
		});
	} catch (error: any) {
		logger.error(error.response?.data);

		if (error.response?.data.title !== "Member Exists") {
			throw error;
		}
	}
});
