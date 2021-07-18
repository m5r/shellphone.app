/**
 * @jest-environment jsdom
 */

jest.mock("next/router", () => ({
	useRouter: jest.fn().mockImplementation(() => ({ query: {} })),
}));
jest.mock("../../../hooks/use-auth");
jest.mock("../../../database/users", () => ({
	findTeamOwner: jest.fn(),
	findUser: jest.fn(),
}));

import { rest } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../../../jest/testing-library";

import InvitationPage, {
	getServerSideProps,
} from "../../../pages/team/invitation";
import useAuth from "../../../hooks/use-auth";
import { findTeamOwner, findUser } from "../../../database/users";
import { generateSignInToken } from "../../../pages/api/team/_invite";

describe("/team/invitation", () => {
	type RequestBody = {
		token: string;
		name: string;
		email: string;
		password: string;
	};

	const mockedFindTeamOwner = findTeamOwner as jest.Mock<
		ReturnType<typeof findTeamOwner>
	>;
	const mockedFindUser = findUser as jest.Mock<ReturnType<typeof findUser>>;
	const mockedUseAuth = useAuth as ReturnType<typeof jest.fn>;
	const mockedSignIn = jest.fn();
	mockedUseAuth.mockImplementation(() => ({
		signIn: mockedSignIn,
		socialProviders: [],
	}));

	const server = setupServer(
		rest.post<RequestBody>(
			"/api/team/accept-invitation",
			(req, res, ctx) => {
				return res(ctx.status(200));
			},
		),
	);

	beforeEach(() => {
		mockedUseAuth.mockClear();
		mockedFindTeamOwner.mockClear();
		mockedFindUser.mockClear();
	});
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	const inviteeEmail = "test@fss.dev";
	const teamId = "123";
	const teamOwner: any = {
		name: "Groot",
	};

	test("accept invitation", async () => {
		render(
			<InvitationPage
				email={inviteeEmail}
				teamId={teamId}
				teamOwner={teamOwner}
			/>,
		);

		userEvent.type(screen.getByLabelText("Name"), "John Doe");
		userEvent.type(screen.getByLabelText(/^Password/)!, "password{enter}");

		await waitFor(() => expect(mockedSignIn).toBeCalledTimes(1));
	});

	describe("getServerSideProps", () => {
		const baseContext: any = {
			req: {},
			res: {},
			resolvedUrl: "/team/invitation",
		};

		test("decode token and return props", async () => {
			const userId = "111";
			const invitedUser: any = {
				id: userId,
				email: inviteeEmail,
				teamId,
				pendingInvitation: true,
			};
			mockedFindTeamOwner.mockResolvedValueOnce(teamOwner);
			mockedFindUser.mockResolvedValueOnce(invitedUser);
			const token = await generateSignInToken({ teamId, userId });
			const context = {
				...baseContext,
				query: { token },
			};

			const serverSideProps = await getServerSideProps(context);
			expect(serverSideProps).toStrictEqual({
				props: {
					email: inviteeEmail,
					teamId,
					teamOwner,
				},
			});
		});

		test("redirect to sign in page if token is invalid", async () => {
			const context = {
				...baseContext,
				query: { token: "" },
			};
			const serverSideProps = await getServerSideProps(context);
			expect(serverSideProps).toStrictEqual({
				redirect: {
					permanent: false,
					destination: "/auth/sign-in?error=invalid-invitation",
				},
			});
		});
	});
});
