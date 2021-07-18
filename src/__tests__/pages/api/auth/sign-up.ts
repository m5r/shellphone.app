jest.mock("../../../../pages/api/user/_auth0", () => ({
	setAppMetadata: jest.fn(),
}));
jest.mock("../../../../pages/api/_send-email", () => ({
	sendEmail: jest.fn(),
}));
jest.mock("../../../../database/users", () => ({ createUser: jest.fn() }));
jest.mock("../../../../database/teams", () => ({ createTeam: jest.fn() }));

import { parse } from "set-cookie-parser";

import { callApiHandler } from "../../../../../jest/helpers";
import signUpHandler from "../../../../pages/api/auth/sign-up";
import { sessionName } from "../../../../../lib/cookie-store";
import { sendEmail } from "../../../../pages/api/_send-email";
import { createUser } from "../../../../database/users";
import { createTeam } from "../../../../database/teams";

describe("/api/auth/sign-up", () => {
	const mockedSendEmail = sendEmail as jest.Mock<
		ReturnType<typeof sendEmail>
	>;
	const mockedCreateUser = createUser as jest.Mock<
		ReturnType<typeof createUser>
	>;
	const mockedCreateTeam = createTeam as jest.Mock<
		ReturnType<typeof createTeam>
	>;

	beforeEach(() => {
		mockedSendEmail.mockClear();
		mockedCreateUser.mockClear();
		mockedCreateTeam.mockClear();
	});

	test("responds 405 to GET", async () => {
		const response = await callApiHandler(signUpHandler, { method: "GET" });
		expect(response.status).toBe(405);
	});

	test("responds 400 to POST with malformed body", async () => {
		const response = await callApiHandler(signUpHandler, {
			method: "POST",
		});
		expect(response.status).toBe(400);
	});

	test("responds 200 to POST with body from email login", async () => {
		mockedCreateUser.mockResolvedValue({
			id: "auth0|1234567",
			teamId: "98765",
			role: "owner",
			email: "test@fss.dev",
			name: "Groot",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockedCreateTeam.mockResolvedValue({
			id: "98765",
			subscriptionId: null,
			teamMembersLimit: 1,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		const body = {
			accessToken:
				"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL21va2h0YXIuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDEyMzQ1NjciLCJhdWQiOlsiaHR0cHM6Ly9tb2todGFyLmV1LmF1dGgwLmNvbS9hcGkvdjIvIiwiaHR0cHM6Ly9tb2todGFyLmV1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2MTkzMDMyNDUsImV4cCI6MTYxOTM4OTY0NSwiYXpwIjoiZUVWZm5rNkRCN2JDMzNOdUFvd3VjNTRmdXZZQm9OODQiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIHJlYWQ6Y3VycmVudF91c2VyIHVwZGF0ZTpjdXJyZW50X3VzZXJfbWV0YWRhdGEgZGVsZXRlOmN1cnJlbnRfdXNlcl9tZXRhZGF0YSBjcmVhdGU6Y3VycmVudF91c2VyX21ldGFkYXRhIGNyZWF0ZTpjdXJyZW50X3VzZXJfZGV2aWNlX2NyZWRlbnRpYWxzIGRlbGV0ZTpjdXJyZW50X3VzZXJfZGV2aWNlX2NyZWRlbnRpYWxzIHVwZGF0ZTpjdXJyZW50X3VzZXJfaWRlbnRpdGllcyBvZmZsaW5lX2FjY2VzcyIsImd0eSI6InBhc3N3b3JkIn0",
			idToken:
				"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuaWNrbmFtZSI6InRlc3QiLCJuYW1lIjoiR3Jvb3QiLCJwaWN0dXJlIjoiaHR0cHM6Ly9zLmdyYXZhdGFyLmNvbS9hdmF0YXIvYTNiNWU5MjkzYWE1MjE1MTUxZTdjOWVhM2FlZjE4MGQ/cz00ODAmcj1wZyZkPWh0dHBzJTNBJTJGJTJGY2RuLmF1dGgwLmNvbSUyRmF2YXRhcnMlMkZnci5wbmciLCJ1cGRhdGVkX2F0IjoiMjAyMS0wNC0yNFQyMjoyNzoyNS43ODlaIiwiZW1haWwiOiJ0ZXN0QGZzcy5kZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9tb2todGFyLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHwxMjM0NTY3IiwiYXVkIjoiZUVWZm5rNkRCN2JDMzNOdUFvd3VjNTRmdXZZQm9OODQiLCJpYXQiOjE2MTkzMDMyNDUsImV4cCI6MTYxOTMzOTI0NX0",
			scope:
				"openid profile email read:current_user update:current_user_metadata delete:current_user_metadata create:current_user_metadata create:current_user_device_credentials delete:current_user_device_credentials update:current_user_identities offline_access",
			tokenType: "Bearer",
			refreshToken:
				"v1.Mb2-7pHz02BMS63hMwHhjFCq5KPy0L29ZENzKIr-KaIFuSxhqDvLTac-ZLwrbQR6KOYRq21d5R5QLvZfeKZMCGM",
			expiresIn: 86400,
		};
		const response = await callApiHandler(signUpHandler, {
			method: "POST",
			body,
		});
		expect(response.status).toBe(200);
		expect(mockedSendEmail).toBeCalledTimes(1);
		expect(mockedSendEmail.mock.calls[0][0].recipients[0]).toBe(
			"test@fss.dev",
		);

		const setCookieHeader = response.headers.get("set-cookie")!;
		const parsedCookies = parse(setCookieHeader);
		const cookieHasSession = parsedCookies.some((cookie) =>
			cookie.name.match(`^${sessionName}(?:\\.\\d)?$`),
		);
		expect(cookieHasSession).toBe(true);
	});
});
