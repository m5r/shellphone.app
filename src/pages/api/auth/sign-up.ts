import type { NextApiRequest, NextApiResponse } from "next";
import type { UserCredentials } from "@supabase/supabase-js";
import Joi from "joi";

import type { ApiError } from "../_types";
import appLogger from "../../../../lib/logger";
import { sendEmail } from "../_send-email";
import supabase from "../../../supabase/server";
import { createCustomer } from "../../../database/customer";

type Response = void | ApiError;

type Body = Pick<UserCredentials, "email" | "password"> & {
	name: string;
};

const logger = appLogger.child({ route: "/api/auth/sign-up" });

const bodySchema = Joi.object<Body>({
	name: Joi.string().required(),
	email: Joi.string().required(),
	password: Joi.string().required(),
});

export default async function signUp(
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
	const { error, user } = await supabase.auth.signUp({ email: body.email, password: body.password });
	if (error) {
		// @ts-ignore
		const statusCode = error.status ?? 400;
		const apiError: ApiError = {
			statusCode,
			errorMessage: error.message,
		};
		logger.error(error);

		res.status(statusCode).send(apiError);
		return;
	}

	await Promise.all([
		supabase.auth.update({ data: { name: body.name } }),
		createCustomer({
			id: user!.id,
			email: body.email!,
			name: body.name,
		}),
	]);

	console.log("user", user);
	const email = user!.email;

	if (email && email !== "") {
		await sendEmail({
			subject: "Welcome to my app",
			body: `Hi there,

Thanks for signing up to my app.`,
			recipients: [email],
		});
	}

	res.status(200).end();
}
