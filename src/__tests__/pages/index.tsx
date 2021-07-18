/**
 * @jest-environment jsdom
 */
import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, screen } from "../../../jest/testing-library";
import { waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

import Index from "../../pages";

describe("/", () => {
	test("landing page snapshot", () => {
		const { asFragment } = render(<Index />);

		expect(asFragment()).toMatchSnapshot();
	});

	describe("subscribe to newsletter", () => {
		const server = setupServer(
			rest.post("/api/newsletter/subscribe", (req, res, ctx) => {
				return res(ctx.status(200));
			}),
		);

		beforeAll(() => server.listen());
		afterEach(() => server.resetHandlers());
		afterAll(() => server.close());

		test("should display successful message after subscribing", async () => {
			render(<Index />);

			userEvent.type(
				screen.getByPlaceholderText("Email address"),
				"test@fss.dev{enter}",
			);
			await waitFor(() =>
				expect(
					screen.getByText(
						"Thanks! We'll let you know when we launch",
					),
				).toBeInTheDocument(),
			);
		});
	});
});
