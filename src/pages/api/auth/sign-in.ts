import type { NextApiRequest, NextApiResponse } from "next";
import type { UserCredentials } from "@supabase/supabase-js";
import Joi from "joi";

import type { ApiError } from "../_types";
import appLogger from "../../../../lib/logger";
import supabase from "../../../supabase/server";

type Response = void | ApiError;

type Body = Pick<UserCredentials, "email" | "password">;

const logger = appLogger.child({ route: "/api/auth/sign-in" });

const bodySchema = 	Joi.object<Body>({
	email: Joi.string().required(),
	password: Joi.string().required(),
});

export default async function signIn(
	req: NextApiRequest,
	res: NextApiResponse<Response>,
): Promise<void> {
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

	const validationResult = bodySchema.validate(req.body, { stripUnknown: true });
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

	const body: Body = validationResult.value;
	const { error } = await supabase.auth.signIn({
		email: body.email,
		password: body.password,
	});
	if (error) {
		const statusCode = 400;
		const apiError: ApiError = {
			statusCode,
			errorMessage: error.message,
		};
		logger.error(error);

		res.status(statusCode).send(apiError);
		return;
	}

	supabase.auth.api.setAuthCookie(req, res);

	res.status(200).end();
}
