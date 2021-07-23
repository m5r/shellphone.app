import Joi from "joi";

import { withApiAuthRequired } from "../../../../lib/session-helpers";
import { findConversation } from "../../../database/message";
import type { ApiError } from "../_types";
import appLogger from "../../../../lib/logger";

const logger = appLogger.child({ route: "/api/conversation" });

type Query = {
	recipient: string;
}

const querySchema = Joi.object<Query>({
	recipient: Joi.string().required(),
});

export default withApiAuthRequired(async function getConversationHandler(
	req,
	res,
	user,
) {
	if (req.method !== "GET") {
		const statusCode = 405;
		const apiError: ApiError = {
			statusCode,
			errorMessage: `Method ${req.method} Not Allowed`,
		};
		logger.error(apiError);

		res.setHeader("Allow", ["GET"]);
		res.status(statusCode).send(apiError);
		return;
	}

	const validationResult = querySchema.validate(req.query, { stripUnknown: true });
	const validationError = validationResult.error;
	if (validationError) {
		const statusCode = 400;
		const apiError: ApiError = {
			statusCode,
			errorMessage: "Query is malformed",
		};
		logger.error(validationError);

		res.status(statusCode).send(apiError);
		return;
	}

	const { recipient }: Query = validationResult.value;
	const conversation = await findConversation(user.id, recipient);

	return res.status(200).send(conversation);
});
