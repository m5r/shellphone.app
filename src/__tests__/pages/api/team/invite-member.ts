jest.mock("../../../../pages/api/_send-email", () => ({
	sendEmail: jest.fn(),
}));
jest.mock("../../../../database/users", () => ({
	createInvitedUser: jest.fn(),
	findUserByEmail: jest.fn(),
}));
jest.mock("../../../../pages/api/user/_auth0", () => ({
	createAuth0User: jest.fn(),
}));

import inviteMemberHandler from "../../../../pages/api/team/invite-member";
import { callApiHandler } from "../../../../../jest/helpers";
import { sendEmail } from "../../../../pages/api/_send-email";
import { createInvitedUser, findUserByEmail } from "../../../../database/users";
import { createAuth0User } from "../../../../pages/api/user/_auth0";

describe("/api/team/invite-member", () => {
	const mockedSendEmail = sendEmail as jest.Mock<
		ReturnType<typeof sendEmail>
	>;
	const mockedCreateInvitedUser = createInvitedUser as jest.Mock<
		ReturnType<typeof createInvitedUser>
	>;
	const mockedFindUserByEmail = findUserByEmail as jest.Mock<
		ReturnType<typeof findUserByEmail>
	>;
	const mockedCreateAuth0User = createAuth0User as jest.Mock<
		ReturnType<typeof createAuth0User>
	>;

	mockedSendEmail.mockResolvedValue();

	beforeEach(() => {
		mockedSendEmail.mockClear();
		mockedCreateInvitedUser.mockClear();
		mockedFindUserByEmail.mockClear();
		mockedCreateAuth0User.mockClear();
	});

	test("responds 405 to GET", async () => {
		const { status } = await callApiHandler(inviteMemberHandler, {
			method: "GET",
			authentication: "auth0",
		});
		expect(status).toBe(405);
	});

	test("responds 400 to POST with malformed body", async () => {
		const { status } = await callApiHandler(inviteMemberHandler, {
			method: "POST",
			authentication: "auth0",
			body: {},
		});
		expect(status).toBe(400);
	});

	test("responds 500 to POST with valid body but already taken email address", async () => {
		const inviteeEmail = "test@fss.dev";
		mockedFindUserByEmail.mockResolvedValueOnce({
			email: inviteeEmail,
		} as any);

		const body = { inviteeEmail };
		const { status } = await callApiHandler(inviteMemberHandler, {
			method: "POST",
			authentication: "auth0",
			body,
		});
		expect(status).toBe(500);
	});

	test("responds 200 to POST with valid body", async () => {
		const inviteeUserId = "2";
		const inviteeEmail = "test@fss.dev";
		mockedCreateAuth0User.mockResolvedValueOnce({ user_id: inviteeUserId });

		const body = { inviteeEmail };
		const { status } = await callApiHandler(inviteMemberHandler, {
			method: "POST",
			authentication: "auth0",
			body,
		});
		expect(status).toBe(200);
		expect(mockedSendEmail.mock.calls[0][0].recipients).toStrictEqual([
			inviteeEmail,
		]);
		expect(mockedCreateInvitedUser).toHaveBeenCalledTimes(1);
	});
});
