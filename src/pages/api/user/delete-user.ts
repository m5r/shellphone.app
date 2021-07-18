import type { ApiError } from "../_types";
import { withApiAuthRequired } from "../../../../lib/session-helpers";
import { deleteSubscription } from "../../../database/subscriptions";
import { cancelPaddleSubscription } from "../../../subscription/_paddle-api";

import appLogger from "../../../../lib/logger";

type Response = void | ApiError;

const logger = appLogger.child({ route: "/api/user/delete-user" });

export default withApiAuthRequired<Response>(async function deleteUserHandler(
	req,
	res,
	session,
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

	const { id: userId, role, teamId } = session.user;
	const team = await findTeam({ id: teamId });
	const subscriptionId = team!.subscriptionId;

	try {
		let actions: Promise<any>[] = [
			deleteAuth0User({ id: userId }),
			deleteUser({ id: userId, teamId }),
		];

		if (role === "owner") {
			const teamMembers = await findUsersByTeam({ teamId });

			teamMembers.forEach((member) =>
				actions.push(deleteUser({ id: member.id, teamId })),
			);
			actions.push(deleteTeam({ id: teamId }));

			if (subscriptionId) {
				actions.push(
					cancelPaddleSubscription({ subscriptionId }),
					deleteSubscription({
						paddleSubscriptionId: subscriptionId,
					}),
				);
			}
		}

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
