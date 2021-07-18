jest.mock("auth0", () => ({
	ManagementClient: jest.fn(),
}));

jest.mock("openid-client", () => ({
	Issuer: {
		discover: jest.fn().mockImplementation(() => ({
			Client: jest.fn().mockImplementation(() => ({
				refresh: jest.fn().mockImplementation(() => ({
					claims: jest.fn().mockResolvedValue({}),
				})),
			})),
		})),
	},
}));

jest.mock("../../../../database/users", () => ({
	findUser: jest.fn(),
	updateUser: jest.fn(),
}));

import { ManagementClient } from "auth0";

import { callApiHandler } from "../../../../../jest/helpers";
import updateUserHandler from "../../../../pages/api/user/update-user";
import { findUser, updateUser } from "../../../../database/users";

describe("/api/user/update-user", () => {
	const mockedManagementClient = ManagementClient as ReturnType<
		typeof jest.fn
	>;
	const mockedUpdateAuth0User = jest.fn();
	mockedManagementClient.mockImplementation(() => ({
		updateUser: mockedUpdateAuth0User,
	}));

	const mockedFindUser = findUser as ReturnType<typeof jest.fn>;
	const mockedUpdateUser = updateUser as ReturnType<typeof jest.fn>;
	mockedFindUser.mockImplementation(() =>
		Promise.resolve({
			id: "auth0|1234567",
			email: "test@fss.dev",
			name: "Groot",
			createdAt: new Date(),
			updatedAt: new Date(),
		}),
	);

	beforeEach(() => {
		mockedUpdateAuth0User.mockClear();
		mockedFindUser.mockClear();
		mockedUpdateUser.mockClear();
	});

	test("responds 401 to unauthenticated request", async () => {
		const response = await callApiHandler(updateUserHandler, {
			method: "POST",
		});
		expect(response.status).toBe(401);
	});

	test("responds 405 to authenticated GET", async () => {
		const response = await callApiHandler(updateUserHandler, {
			method: "GET",
			authentication: "auth0",
		});
		expect(response.status).toBe(405);
	});

	test("responds 400 to authenticated POST with malformed body", async () => {
		const body = { name: "", email: "", password: "" };
		const response = await callApiHandler(updateUserHandler, {
			method: "POST",
			authentication: "auth0",
			body,
		});
		expect(response.status).toBe(400);
	});

	test("updates user password and responds 200 to authenticated POST", async () => {
		const body = { name: "", email: "", password: "dddddd" };
		const response = await callApiHandler(updateUserHandler, {
			method: "POST",
			authentication: "auth0",
			body,
		});
		expect(response.status).toBe(200);
		expect(mockedUpdateAuth0User).toBeCalledTimes(1);
	});

	test("updates both user password & email and responds 200 to authenticated POST", async () => {
		const body = { name: "", email: "test@fss.xyz", password: "dddddd" };
		const response = await callApiHandler(updateUserHandler, {
			method: "POST",
			authentication: "auth0",
			body,
		});
		expect(response.status).toBe(200);
		expect(mockedUpdateAuth0User).toBeCalledTimes(2);
	});

	test("responds 403 to authenticated POST when updating email for a 3rd party-authenticated user", async () => {
		const body = { name: "", email: "test@fss.xyz", password: "dddddd" };
		const response = await callApiHandler(updateUserHandler, {
			method: "POST",
			authentication: "google-oauth2",
			body,
		});
		expect(response.status).toBe(403);
		expect(mockedUpdateAuth0User).toBeCalledTimes(0);
	});
});
