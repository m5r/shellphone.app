import type { ApiError } from "../_types";
import { withApiAuthRequired } from "../../../../lib/session-helpers";
import { deleteSubscription } from "../../../database/subscriptions";
import { cancelPaddleSubscription } from "../../../subscription/_paddle-api";

import appLogger from "../../../../lib/logger";
import supabase from "../../../supabase/server";

type Response = void | ApiError;

const logger = appLogger.child({ route: "/api/user/delete-user" });

export default withApiAuthRequired<Response>(async function deleteUserHandler(
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

	try {
		let actions: Promise<any>[] = [
			supabase.auth.api.deleteUser(user.id, ""),
		];

		// TODO: delete user phone number/messages
		await Promise.all(actions);

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
