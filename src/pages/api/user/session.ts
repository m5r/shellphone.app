import type { ApiError } from "../_types";
import type Session from "../../../../lib/session";
import {
	sessionCache,
	withApiAuthRequired,
} from "../../../../lib/session-helpers";
import appLogger from "../../../../lib/logger";

type Response = Session | ApiError;

const logger = appLogger.child({ route: "/api/user/session" });

export default withApiAuthRequired<Response>(async function session(req, res) {
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

	const session = sessionCache.get(req, res)!;

	res.status(200).send(session);
});
