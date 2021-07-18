/**
 * @jest-environment jsdom
 */

jest.mock("next/router", () => ({
	useRouter: jest.fn(),
	withRouter: (element: ComponentType) => element,
}));
jest.mock("../../../../database/users", () => ({ findUsersByTeam: jest.fn() }));
jest.mock("../../../../database/teams", () => ({ findTeam: jest.fn() }));

import type { ComponentType, FunctionComponent } from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { useRouter } from "next/router";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { render, waitFor, screen } from "../../../../../jest/testing-library";
import { act, waitForElementToBeRemoved } from "@testing-library/react";

import type { SerializedSession } from "../../../../../lib/session";
import Session from "../../../../../lib/session";
import type { TeamMembers } from "../../../../pages/api/team/members";
import TeamPage, {
	getServerSideProps,
} from "../../../../pages/account/settings/team";
import type { User } from "../../../../database/users";
import { findUsersByTeam } from "../../../../database/users";
import { findTeam } from "../../../../database/teams";
import { sessionCache } from "../../../../../lib/session-helpers";
import { SessionProvider } from "../../../../session-context";
import { SidebarProvider } from "../../../../components/layout/sidebar";

describe("/account/settings/team", () => {
	const mockedPush = jest.fn();
	const mockedUseRouter = useRouter as jest.Mock<
		Partial<ReturnType<typeof useRouter>>
	>;
	const mockedFindTeam = findTeam as jest.Mock<ReturnType<typeof findTeam>>;
	const mockedFindUsersByTeam = findUsersByTeam as jest.Mock<
		ReturnType<typeof findUsersByTeam>
	>;
	window.IntersectionObserver = jest
		.fn()
		.mockImplementation(() => ({
			observe: () => null,
			disconnect: () => null,
		}));

	const session: SerializedSession = {
		user: {
			id: "auth0|1234567",
			email: "test@fss.dev",
			name: "test",
			role: "owner",
			teamId: "98765",
		},
	};
	const createdAt = new Date();
	const teamMembers = [
		{
			...session.user,
			createdAt,
			updatedAt: createdAt,
		},
	];
	const team = {
		id: "98765",
		subscriptionId: null,
		teamMembersLimit: 2,
		createdAt,
		updatedAt: createdAt,
	};
	const teamMembersResponse: TeamMembers = {
		teamMembers,
		teamMembersLimit: team.teamMembersLimit,
	};

	const server = setupServer(
		rest.get("/api/user/session", (req, res, ctx) => {
			return res(ctx.status(200), ctx.json(session));
		}),
		rest.get("/api/team/members", (req, res, ctx) => {
			return res(ctx.status(200), ctx.json(teamMembersResponse));
		}),
	);

	mockedFindUsersByTeam.mockResolvedValue(teamMembers);
	mockedFindTeam.mockResolvedValue(team);

	const queryClient = new QueryClient();
	const wrapper: FunctionComponent = ({ children }) => {
		return (
			<QueryClientProvider client={queryClient}>
				<SidebarProvider>
					<SessionProvider session={session}>
						{children}
					</SessionProvider>
				</SidebarProvider>
			</QueryClientProvider>
		);
	};

	beforeEach(() => {
		mockedPush.mockClear();
		mockedUseRouter.mockClear();
		mockedFindTeam.mockClear();
		mockedFindUsersByTeam.mockClear();
		mockedUseRouter.mockImplementation(() => ({
			push: mockedPush,
			pathname: "/account/settings",
		}));
		queryClient.clear();
	});
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test("list team members and display team limit", async () => {
		const teamMembersLimit = team.teamMembersLimit;

		render(
			<TeamPage
				session={session}
				teamMembers={teamMembers}
				teamMembersLimit={teamMembersLimit}
			/>,
			{ wrapper },
		);

		await waitFor(() =>
			screen.getByText(
				(_, node) =>
					node?.textContent ===
					"Your team has 1 out of 2 team members.",
			),
		);
	});

	test("invite someone", async () => {
		const inviteMemberHandler = jest.fn();
		server.use(
			rest.post("/api/team/invite-member", (req, res, ctx) => {
				inviteMemberHandler();
				return res(ctx.status(200));
			}),
		);

		const teamMembersLimit = team.teamMembersLimit;

		await act(async () => {
			render(
				<TeamPage
					session={session}
					teamMembers={teamMembers}
					teamMembersLimit={teamMembersLimit}
				/>,
				{ wrapper },
			);

			userEvent.click(screen.getByText("Invite member"));
			await waitFor(() =>
				screen.getByText("Invite a member to your team"),
			);
			userEvent.type(
				screen.getByLabelText("Email address"),
				"recipient@fss.dev{enter}",
			);
			await waitForElementToBeRemoved(
				screen.getByLabelText("Email address"),
			);
			expect(inviteMemberHandler).toBeCalledTimes(1);
		});
	});

	describe("team member management", () => {
		const createdAt = new Date();
		const invitedUser: User = {
			id: "auth0|112233",
			email: "recipient@fss.dev",
			name: "recipient",
			teamId: session.user.teamId,
			role: "member",
			pendingInvitation: true,
			createdAt,
			updatedAt: createdAt,
		};
		const teamMembers = [
			{
				...session.user,
				createdAt,
				updatedAt: createdAt,
			},
			invitedUser,
		];
		const team = {
			id: "98765",
			subscriptionId: null,
			teamMembersLimit: 2,
			createdAt,
			updatedAt: createdAt,
		};
		const teamMembersResponse: TeamMembers = {
			teamMembers,
			teamMembersLimit: team.teamMembersLimit,
		};
		const teamMembersLimit = team.teamMembersLimit;

		server.use(
			rest.get("/api/team/members", (req, res, ctx) => {
				return res(ctx.status(200), ctx.json(teamMembersResponse));
			}),
		);

		test("re-send invitation", async () => {
			const resendInvitationHandler = jest.fn();
			server.use(
				rest.post("/api/team/resend-invitation", (req, res, ctx) => {
					resendInvitationHandler();
					return res.once(ctx.status(200));
				}),
			);

			render(
				<TeamPage
					session={session}
					teamMembers={teamMembers}
					teamMembersLimit={teamMembersLimit}
				/>,
				{ wrapper },
			);

			userEvent.click(
				screen.getByTestId(`manage-team-member-${invitedUser.id}`),
			);
			userEvent.click(screen.getByText("Re-send invitation"));
			await waitFor(() =>
				expect(resendInvitationHandler).toBeCalledTimes(1),
			);
		});

		test("cancel invitation", async () => {
			const cancelInvitationHandler = jest.fn();
			server.use(
				rest.post("/api/team/remove-member", (req, res, ctx) => {
					cancelInvitationHandler();
					return res.once(ctx.status(200));
				}),
			);

			render(
				<TeamPage
					session={session}
					teamMembers={teamMembers}
					teamMembersLimit={teamMembersLimit}
				/>,
				{ wrapper },
			);

			// await waitFor(() => screen.getByText((_, node) => node?.textContent === "Your team has 2 out of 2 team members."));
			userEvent.click(
				screen.getByTestId(`manage-team-member-${invitedUser.id}`),
			);
			userEvent.click(screen.getByText("Cancel invitation"));
			userEvent.click(screen.getByText("Remove from my team"));
			await waitFor(() =>
				expect(cancelInvitationHandler).toBeCalledTimes(1),
			);
			await waitFor(() =>
				screen.getByText(
					(_, node) =>
						node?.textContent ===
						"Your team has 1 out of 2 team members.",
				),
			);
		});
	});

	describe("getServerSideProps", () => {
		const context: any = {
			req: {},
			res: {},
			resolvedUrl: "/account/settings/team",
		};
		sessionCache.set(context.req, context.req, new Session(session.user));

		test("return team members and team limit", async () => {
			const serverSideProps = await getServerSideProps(context);
			// @ts-ignore
			delete serverSideProps.props._superjson;
			expect(serverSideProps).toStrictEqual({
				props: {
					session: {
						accessToken: null,
						accessTokenExpiresAt: null,
						accessTokenScope: null,
						idToken: null,
						refreshToken: null,
						user: {
							email: "test@fss.dev",
							id: "auth0|1234567",
							name: "test",
							role: "owner",
							teamId: "98765",
						},
					},
					teamMembers: [
						{
							createdAt: createdAt.toISOString(),
							email: "test@fss.dev",
							id: "auth0|1234567",
							name: "test",
							role: "owner",
							teamId: "98765",
							updatedAt: createdAt.toISOString(),
						},
					],
					teamMembersLimit: 2,
				},
			});
		});
	});
});
