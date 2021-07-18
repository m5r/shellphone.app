jest.mock("../../../../pages/api/user/_auth0", () => ({
	getAppMetadata: jest.fn(),
	setAppMetadata: jest.fn(),
}));
jest.mock("../../../../database/users", () => ({
	findUser: jest.fn(),
	createUser: jest.fn(),
}));
jest.mock("../../../../pages/api/_send-email", () => ({
	sendEmail: jest.fn(),
}));
jest.mock("../../../../database/teams", () => ({ createTeam: jest.fn() }));

import { parse } from "set-cookie-parser";

import { callApiHandler } from "../../../../../jest/helpers";
import signInHandler from "../../../../pages/api/auth/sign-in";
import { sessionName } from "../../../../../lib/cookie-store";
import { sendEmail } from "../../../../pages/api/_send-email";
import { findUser, createUser } from "../../../../database/users";
import { createTeam } from "../../../../database/teams";
import { getAppMetadata } from "../../../../pages/api/user/_auth0";

describe("/api/auth/sign-in", () => {
	const mockedSendEmail = sendEmail as jest.Mock<
		ReturnType<typeof sendEmail>
	>;
	const mockedGetAppMetadata = getAppMetadata as jest.Mock<
		ReturnType<typeof getAppMetadata>
	>;
	const mockedFindUser = findUser as jest.Mock<ReturnType<typeof findUser>>;
	const mockedCreateUser = createUser as jest.Mock<
		ReturnType<typeof createUser>
	>;
	const mockedCreateTeam = createTeam as jest.Mock<
		ReturnType<typeof createTeam>
	>;

	beforeEach(() => {
		mockedFindUser.mockClear();
		mockedCreateUser.mockClear();
		mockedGetAppMetadata.mockClear();
		mockedSendEmail.mockClear();
		mockedCreateTeam.mockClear();
	});

	test("responds 405 to GET", async () => {
		const response = await callApiHandler(signInHandler, { method: "GET" });
		expect(response.status).toBe(405);
	});

	test("responds 400 to POST with malformed body", async () => {
		const response = await callApiHandler(signInHandler, {
			method: "POST",
		});
		expect(response.status).toBe(400);
	});

	test("responds 200 to POST with body from email login", async () => {
		mockedFindUser.mockResolvedValue({
			id: "auth0|1234567",
			teamId: "98765",
			role: "owner",
			email: "test@fss.dev",
			name: "Groot",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockedGetAppMetadata.mockResolvedValue({ teamId: "98765" });

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
		const response = await callApiHandler(signInHandler, {
			method: "POST",
			body,
		});
		expect(response.status).toBe(200);

		const setCookieHeader = response.headers.get("set-cookie")!;
		const parsedCookies = parse(setCookieHeader);
		const cookieHasSession = parsedCookies.some((cookie) =>
			cookie.name.match(`^${sessionName}(?:\\.\\d)?$`),
		);
		expect(cookieHasSession).toBe(true);
	});

	test("responds 200 to POST with body from 3rd party provider login", async () => {
		mockedFindUser.mockResolvedValue({
			id: "google-oauth2|103423079071922868186",
			teamId: "98765",
			role: "owner",
			email: "fss.user@gmail.com",
			name: "FSS User",
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockedGetAppMetadata.mockResolvedValue({ teamId: "98765" });

		const body = {
			accessToken:
				"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL21va2h0YXIuZXUuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTAzNDIzMDc5MDcxOTIyODY4MTg2IiwiYXVkIjpbImh0dHBzOi8vbW9raHRhci5ldS5hdXRoMC5jb20vYXBpL3YyLyIsImh0dHBzOi8vbW9raHRhci5ldS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjEzMjI4ODY4LCJleHAiOjE2MTMyMzYwNjgsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgb2ZmbGluZV9hY2Nlc3MifQ",
			idToken:
				"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJnaXZlbl9uYW1lIjoiRlNTIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwibmlja25hbWUiOiJmc3MudXNlciIsIm5hbWUiOiJGU1MgVXNlciIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vLXgycjhsd0ptUGpNL0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FNWnV1Y25xLWFocW4tR2VyTHhwakEzODZDbi1kUEtyWkEvczk2LWMvcGhvdG8uanBnIiwibG9jYWxlIjoiZW4iLCJ1cGRhdGVkX2F0IjoiMjAyMS0wMi0xM1QxNTowNzo0OC4zNDlaIiwiZW1haWwiOiJmc3MudXNlckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9tb2todGFyLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwMzQyMzA3OTA3MTkyMjg2ODE4NiIsImF1ZCI6ImF1ZGllbmNlIiwiaWF0IjoxNjEzMjI4ODY4LCJleHAiOjE2MTMyNjQ4NjgsImF0X2hhc2giOiJiQnFSWVlNUWJzUW5od1R5dGR0SmZBIiwibm9uY2UiOiJDeXJuVm1PU3Q0b0pwWkFDaTQwaXU1YUxON3JGM0JrayJ9.G-mNH6NegAJvaX77nijdrBAXJtNbwzyzLSFLvZOuRMojTxHaecwQyPw4oyj98fVx4K7Wvv7XuyTRcP54DsAiyXwaFCyCdU_X0aE058gmXxmD89udd2yWnz24DgjrNmR2EPqcXRZ5eqNH4_XtfhQAtUWhGpvBbmuLfrMphJLfzWn8rMJP185ahTosjrKl8Hun4nRb3IGYQcfOZzDv8JTki8p38tnVIxZA5QBXNDSxNYaoc2u6QsAd8srQ2aScotPuNG82YAECdQ6ySc-ODGtMQsCr3CwqHVhqUD2nyQtuZ1iiMKCcBKHGCVcuMvibKjKrAV-rFAiYccZ3b-AsmB_u6w",
			idTokenPayload: {
				given_name: "FSS",
				family_name: "User",
				nickname: "fss.user",
				name: "FSS User",
				picture:
					"https://lh3.googleusercontent.com/-x2r8lwJmPjM/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucnq-ahqn-GerLxpjA386Cn-dPKrZA/s96-c/photo.jpg",
				locale: "en",
				updated_at: "2021-02-13T15:07:48.349Z",
				email: "fss.user@gmail.com",
				email_verified: true,
				iss: "https://mokhtar.eu.auth0.com/",
				sub: "google-oauth2|103423079071922868186",
				aud: "audience",
				iat: 1613228868,
				exp: 1613264868,
				at_hash: "bBqRYYMQbsQnhwTytdtJfA",
				nonce: "CyrnVmOSt4oJpZACi40iu5aLN7rF3Bkk",
			},
			appState: null,
			refreshToken: null,
			state: "xKre8N8V5iq4s4e6GPYvwpRc00WtIn7u",
			expiresIn: 7200,
			tokenType: "Bearer",
			scope: "openid profile email offline_access",
		};
		const response = await callApiHandler(signInHandler, {
			method: "POST",
			body,
		});
		expect(response.status).toBe(200);

		const setCookieHeader = response.headers.get("set-cookie")!;
		const parsedCookies = parse(setCookieHeader);
		const cookieHasSession = parsedCookies.some((cookie) =>
			cookie.name.match(`^${sessionName}(?:\\.\\d)?$`),
		);
		expect(cookieHasSession).toBe(true);
	});

	test("responds 200 to POST with body from 3rd party provider login for the first time", async () => {
		mockedFindUser.mockResolvedValue(undefined);
		mockedCreateTeam.mockResolvedValue({
			id: "98765",
			subscriptionId: null,
			teamMembersLimit: 1,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockedCreateUser.mockResolvedValue({
			id: "google-oauth2|103423079071922868186",
			teamId: "98765",
			role: "owner",
			email: "fss.user@gmail.com",
			name: "FSS User",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		const body = {
			accessToken:
				"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL21va2h0YXIuZXUuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTAzNDIzMDc5MDcxOTIyODY4MTg2IiwiYXVkIjpbImh0dHBzOi8vbW9raHRhci5ldS5hdXRoMC5jb20vYXBpL3YyLyIsImh0dHBzOi8vbW9raHRhci5ldS5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjEzMjI4ODY4LCJleHAiOjE2MTMyMzYwNjgsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgb2ZmbGluZV9hY2Nlc3MifQ",
			idToken:
				"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJnaXZlbl9uYW1lIjoiRlNTIiwiZmFtaWx5X25hbWUiOiJVc2VyIiwibmlja25hbWUiOiJmc3MudXNlciIsIm5hbWUiOiJGU1MgVXNlciIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vLXgycjhsd0ptUGpNL0FBQUFBQUFBQUFJL0FBQUFBQUFBQUFBL0FNWnV1Y25xLWFocW4tR2VyTHhwakEzODZDbi1kUEtyWkEvczk2LWMvcGhvdG8uanBnIiwibG9jYWxlIjoiZW4iLCJ1cGRhdGVkX2F0IjoiMjAyMS0wMi0xM1QxNTowNzo0OC4zNDlaIiwiZW1haWwiOiJmc3MudXNlckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9tb2todGFyLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwMzQyMzA3OTA3MTkyMjg2ODE4NiIsImF1ZCI6ImF1ZGllbmNlIiwiaWF0IjoxNjEzMjI4ODY4LCJleHAiOjE2MTMyNjQ4NjgsImF0X2hhc2giOiJiQnFSWVlNUWJzUW5od1R5dGR0SmZBIiwibm9uY2UiOiJDeXJuVm1PU3Q0b0pwWkFDaTQwaXU1YUxON3JGM0JrayJ9.G-mNH6NegAJvaX77nijdrBAXJtNbwzyzLSFLvZOuRMojTxHaecwQyPw4oyj98fVx4K7Wvv7XuyTRcP54DsAiyXwaFCyCdU_X0aE058gmXxmD89udd2yWnz24DgjrNmR2EPqcXRZ5eqNH4_XtfhQAtUWhGpvBbmuLfrMphJLfzWn8rMJP185ahTosjrKl8Hun4nRb3IGYQcfOZzDv8JTki8p38tnVIxZA5QBXNDSxNYaoc2u6QsAd8srQ2aScotPuNG82YAECdQ6ySc-ODGtMQsCr3CwqHVhqUD2nyQtuZ1iiMKCcBKHGCVcuMvibKjKrAV-rFAiYccZ3b-AsmB_u6w",
			idTokenPayload: {
				given_name: "FSS",
				family_name: "User",
				nickname: "fss.user",
				name: "FSS User",
				picture:
					"https://lh3.googleusercontent.com/-x2r8lwJmPjM/AAAAAAAAAAI/AAAAAAAAAAA/AMZuucnq-ahqn-GerLxpjA386Cn-dPKrZA/s96-c/photo.jpg",
				locale: "en",
				updated_at: "2021-02-13T15:07:48.349Z",
				email: "fss.user@gmail.com",
				email_verified: true,
				iss: "https://mokhtar.eu.auth0.com/",
				sub: "google-oauth2|103423079071922868186",
				aud: "audience",
				iat: 1613228868,
				exp: 1613264868,
				at_hash: "bBqRYYMQbsQnhwTytdtJfA",
				nonce: "CyrnVmOSt4oJpZACi40iu5aLN7rF3Bkk",
			},
			appState: null,
			refreshToken: null,
			state: "xKre8N8V5iq4s4e6GPYvwpRc00WtIn7u",
			expiresIn: 7200,
			tokenType: "Bearer",
			scope: "openid profile email offline_access",
		};
		const response = await callApiHandler(signInHandler, {
			method: "POST",
			body,
		});
		expect(response.status).toBe(200);
		expect(mockedSendEmail).toBeCalledTimes(1);
		expect(mockedSendEmail.mock.calls[0][0].recipients[0]).toBe(
			"fss.user@gmail.com",
		);

		const setCookieHeader = response.headers.get("set-cookie")!;
		const parsedCookies = parse(setCookieHeader);
		const cookieHasSession = parsedCookies.some((cookie) =>
			cookie.name.match(`^${sessionName}(?:\\.\\d)?$`),
		);
		expect(cookieHasSession).toBe(true);
	});
});
