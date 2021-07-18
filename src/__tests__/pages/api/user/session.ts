import { callApiHandler } from "../../../../../jest/helpers";
import sessionHandler from "../../../../pages/api/user/session";

describe("/api/user/session", () => {
	test("responds 405 to POST", async () => {
		const { status } = await callApiHandler(sessionHandler, {
			method: "POST",
			authentication: "auth0",
		});
		expect(status).toBe(405);
	});

	test("responds 200 with session to GET", async () => {
		const response = await callApiHandler(sessionHandler, {
			method: "GET",
			authentication: "auth0",
		});
		const session = await response.json();
		expect(session.user).toBeDefined();
	});
});
