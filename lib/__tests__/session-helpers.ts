import type { NextApiHandler } from "next";

import { withApiAuthRequired } from "../session-helpers";
import { callApiHandler } from "../../jest/helpers";

describe("session-helpers", () => {
	describe("withApiAuthRequired", () => {
		const basicHandler: NextApiHandler = (req, res) =>
			res.status(200).end();

		test("responds 401 to unauthenticated GET", async () => {
			const withAuthHandler = withApiAuthRequired(basicHandler);
			const { status } = await callApiHandler(withAuthHandler, {
				method: "GET",
			});

			expect(status).toBe(401);
		});

		test("responds 200 to authenticated GET", async () => {
			const withAuthHandler = withApiAuthRequired(basicHandler);
			const { status } = await callApiHandler(withAuthHandler, {
				method: "GET",
				authentication: "auth0",
			});

			expect(status).toBe(200);
		});
	});
});
