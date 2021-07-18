/**
 * @jest-environment jsdom
 */

jest.mock("next/router", () => ({
	useRouter: jest.fn().mockImplementation(() => ({ query: {} })),
}));
jest.mock("../../../hooks/use-auth");

import { rest } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../../../../jest/testing-library";

import useAuth from "../../../hooks/use-auth";

import SignInPage from "../../../pages/auth/sign-in";

describe("/auth/sign-in", () => {
	type RequestBody = {
		email: string;
		password: string;
	};

	const mockedUseAuth = useAuth as ReturnType<typeof jest.fn>;
	const mockedSignIn = jest.fn();
	mockedUseAuth.mockImplementation(() => ({
		signIn: mockedSignIn,
		socialProviders: [],
	}));

	const server = setupServer(
		rest.post<RequestBody>("/api/auth/sign-in", (req, res, ctx) => {
			return res(ctx.status(200));
		}),
	);

	beforeEach(() => mockedUseAuth.mockClear());
	beforeAll(() => server.listen());
	afterEach(() => server.resetHandlers());
	afterAll(() => server.close());

	test("sign in with email", async () => {
		render(<SignInPage />);

		userEvent.type(screen.getByLabelText("Email address"), "test@fss.dev");
		userEvent.type(screen.getByLabelText(/^Password/)!, "password{enter}");

		await waitFor(() => expect(mockedSignIn).toBeCalledTimes(1));
	});
});
