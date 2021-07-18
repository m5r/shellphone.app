/**
 * @jest-environment jsdom
 */

jest.mock("next/router", () => ({
	useRouter: jest.fn(),
	withRouter: (element: ComponentType) => element,
}));

import type { ComponentType, FunctionComponent } from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { useRouter } from "next/router";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { render, waitFor, screen } from "../../../../../jest/testing-library";

import type { SerializedSession } from "../../../../../lib/session";
import SettingsPage from "../../../../pages/account/settings";
import { SessionProvider } from "../../../../session-context";
import { SidebarProvider } from "../../../../components/layout/sidebar";

const consoleError = console.error;

describe("/account/settings", () => {
	type RequestBody = {
		email: string;
		password: string;
	};

	console.error = jest.fn();
	const mockedUseRouter = useRouter as jest.Mock<
		Partial<ReturnType<typeof useRouter>>
	>;
	const mockedPush = jest.fn();
	mockedUseRouter.mockImplementation(() => ({
		push: mockedPush,
		pathname: "/account/settings",
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
	const server = setupServer(
		rest.get("/api/user/session", (req, res, ctx) => {
			return res(ctx.status(200), ctx.json(session));
		}),
		rest.post<RequestBody>("/api/user/update-user", (req, res, ctx) => {
			return res(ctx.status(200));
		}),
	);

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
		queryClient.clear();
	});
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => {
		server.close();
		console.error = consoleError;
	});

	test("update email only", async () => {
		render(<SettingsPage session={session} />, { wrapper });

		userEvent.type(
			screen.getByLabelText("Email address"),
			"test2@fss.dev{enter}",
		);
		await waitFor(() => screen.getByText("Your changes have been saved."));
	});

	test("mismatching passwords", async () => {
		render(<SettingsPage session={session} />, { wrapper });

		userEvent.type(screen.getByLabelText("New password"), "new password");
		userEvent.type(
			screen.getByLabelText("Confirm new password"),
			"does not match{enter}",
		);
		await waitFor(() => screen.getByText("New passwords don't match"));
	});

	test("invalid email format", async () => {
		server.use(
			rest.post<RequestBody>("/api/user/update-user", (req, res, ctx) => {
				return res(
					ctx.status(400),
					ctx.json({
						statusCode: 400,
						errorMessage: "Body is malformed",
					}),
				);
			}),
		);

		render(<SettingsPage session={session} />, { wrapper });

		userEvent.type(
			screen.getByLabelText("Email address"),
			"malformed@email{enter}",
		);
		await waitFor(() => screen.getByText("Body is malformed"));
	});

	test("redirect to sign in page on 401 unauthorized", async () => {
		server.use(
			rest.post<RequestBody>("/api/user/update-user", (req, res, ctx) => {
				return res(ctx.status(401));
			}),
		);

		render(<SettingsPage session={session} />, { wrapper });

		userEvent.type(
			screen.getByLabelText("Email address"),
			"unauthorized@fss.dev{enter}",
		);
		await waitFor(() => expect(mockedPush).toBeCalledTimes(1));
		await waitFor(() => expect(mockedPush).toBeCalledWith("/auth/sign-in"));
	});

	test("redirect to sign in page if user is unauthenticated", async () => {
		server.use(
			rest.get("/api/user/session", (req, res, ctx) => {
				return res(ctx.status(401));
			}),
		);

		const wrapper: FunctionComponent = ({ children }) => {
			return (
				<QueryClientProvider client={queryClient}>
					<SidebarProvider>
						<SessionProvider session={null}>
							{children}
						</SessionProvider>
					</SidebarProvider>
				</QueryClientProvider>
			);
		};

		render(<SettingsPage session={session} />, { wrapper });

		await waitFor(() =>
			expect(mockedPush).toBeCalledWith(
				"/auth/sign-in?redirectTo=/account/settings",
			),
		);
	});
});
