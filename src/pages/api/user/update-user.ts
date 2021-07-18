import Joi from "joi";

import type { ApiError } from "../_types";
import { withApiAuthRequired } from "../../../../lib/session-helpers";
import appLogger from "../../../../lib/logger";
import supabase from "../../../supabase/server";
import { UserAttributes } from "@supabase/gotrue-js/dist/main/lib/types";
import { Customer, updateCustomer } from "../../../database/customer";

type Response = void | ApiError;

type Body = {
	name?: string;
	email?: string;
	password?: string;
	twilioAccountSid?: string;
	twilioAuthToken?: string;
};

const logger = appLogger.child({ route: "/api/user/update-user" });
const bodySchema = 	Joi.object<Body>({
	name: Joi.string().allow(""),
	email: Joi.string().email().allow(""),
	password: Joi.string().allow(""),
	twilioAccountSid: Joi.string().allow(""),
	twilioAuthToken: Joi.string().allow(""),
});

export default withApiAuthRequired<Response>(async function updateUserHandler(
	req,
	res,
	user,
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

	const validationResult = bodySchema.validate(req.body);
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

	const {
		name,
		email,
		password,
		twilioAuthToken,
		twilioAccountSid,
	} = body;
	const shouldUpdateName = name?.length && name !== user.user_metadata.name;
	const shouldUpdateEmail = email?.length && email !== user.email;
	const shouldUpdatePassword = password?.length;
	const shouldUpdateTwilioCredentials = twilioAuthToken?.length && twilioAccountSid?.length;

	try {
		let updatedSupabaseUser: UserAttributes = {};
		let updatedCustomer: Partial<Customer> = {};

		if (shouldUpdateName) {
			updatedSupabaseUser.data = { name };
			updatedCustomer.name = name;
		}

		if (shouldUpdateEmail) {
			updatedSupabaseUser.email = email;
			updatedCustomer.email = email;
			// TODO: once Paddle allows it, update customer email through their API
		}

		if (shouldUpdatePassword) {
			updatedSupabaseUser.password = password;
		}

		if (shouldUpdateTwilioCredentials) {
			updatedCustomer.accountSid = twilioAccountSid;
			updatedCustomer.authToken = twilioAuthToken;
		}

		await Promise.all([
			supabase.auth.update(updatedSupabaseUser),
			updateCustomer(user.id, updatedCustomer),
		]);

		res.status(200).end();
	} catch (error) {
		const statusCode = error.statusCode ?? 500;
		const apiError: ApiError = {
			statusCode,
			errorMessage: error.message,
		};
		logger.error(apiError);

		res.status(statusCode).send(apiError);
	}
});
