import type { NextApiRequest, NextApiResponse } from "next";
import Joi from "joi";

import type { ApiError } from "../_types";
import appLogger from "../../../../lib/logger";
import { addSubscriber } from "./_mailchimp";

type Body = {
	email: string;
};

type Response = {} | ApiError;

const logger = appLogger.child({ route: "/api/newsletter/subscribe" });

const bodySchema = Joi.object<Body>({
	email: Joi.string().email().required(),
});

export default async function subscribeToNewsletter(
	req: NextApiRequest,
	res: NextApiResponse<Response>,
) {
	if (req.method !== "POST") {
		const statusCode = 405;
		const apiError: ApiError = {
			statusCode,
			errorMessage: `Method ${req.method} Not Allowed`,
		};
		logger.error(apiError);

		res.setHeader("Allow", ["POST"]);
		res.status(statusCode).send(apiError);
		return;
	}

	const validationResult = bodySchema.validate(req.body, {
		stripUnknown: true,
	});
	const validationError = validationResult.error;
	if (validationError) {
		const statusCode = 400;
		const apiError: ApiError = {
			statusCode,
			errorMessage: "Body is malformed",
		};
		logger.error(validationError);

		res.status(statusCode).send(apiError);
		return;
	}
	const { email }: Body = validationResult.value;

	try {
		await addSubscriber(email);
	} catch (error) {
		console.log("error", error.response?.data);

		if (error.response?.data.title !== "Member Exists") {
			return res.status(error.response?.status ?? 400).end();
		}
	}

	res.status(200).end();
}
