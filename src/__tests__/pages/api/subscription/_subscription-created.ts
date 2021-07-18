jest.mock("../../../../database/teams", () => ({
	findTeam: jest.fn(),
	updateTeam: jest.fn(),
}));
jest.mock("../../../../database/subscriptions", () => ({
	...jest.requireActual("../../../../database/subscriptions"),
	createSubscription: jest.fn(),
	findTeamSubscription: jest.fn(),
	updateSubscription: jest.fn(),
}));
jest.mock("../../../../pages/api/_send-email", () => ({
	sendEmail: jest.fn(),
}));
jest.mock("../../../../subscription/plans", () => ({
	PAID_PLANS: {
		"229": { teamMembersLimit: 2 },
	},
}));

import { subscriptionCreatedHandler } from "../../../../pages/api/subscription/_subscription-created";
import { callApiHandler } from "../../../../../jest/helpers";
import { findTeam, updateTeam } from "../../../../database/teams";
import {
	createSubscription,
	findUserSubscription,
	updateSubscription,
} from "../../../../database/subscriptions";
import { sendEmail } from "../../../../pages/api/_send-email";

describe("subscription_created webhook event", () => {
	const mockedSendEmail = sendEmail as jest.Mock<
		ReturnType<typeof sendEmail>
	>;
	const mockedFindTeam = findTeam as jest.Mock<ReturnType<typeof findTeam>>;
	const mockedUpdateTeam = updateTeam as jest.Mock<
		ReturnType<typeof updateTeam>
	>;
	const mockedCreateSubscription = createSubscription as jest.Mock<
		ReturnType<typeof createSubscription>
	>;
	const mockedFindTeamSubscription = findUserSubscription as jest.Mock<
		ReturnType<typeof findUserSubscription>
	>;
	const mockedUpdateSubscription = updateSubscription as jest.Mock<
		ReturnType<typeof updateSubscription>
	>;

	mockedSendEmail.mockResolvedValue();

	beforeEach(() => {
		mockedSendEmail.mockClear();
		mockedFindTeam.mockClear();
		mockedUpdateTeam.mockClear();
		mockedCreateSubscription.mockClear();
		mockedFindTeamSubscription.mockClear();
		mockedUpdateSubscription.mockClear();
	});

	test("responds 400 to malformed event", async () => {
		const { status } = await callApiHandler(subscriptionCreatedHandler, {
			method: "POST",
			body: {},
		});
		expect(status).toBe(400);
	});

	test("responds 404 to valid event with unknown team", async () => {
		const teamId = "123";
		const subscriptionId = "222";
		const planId = "229";

		const event = {
			alert_id: 1789225139,
			alert_name: "subscription_created",
			cancel_url:
				"https://checkout.paddle.com/subscription/cancel?user=4&subscription=9&hash=098bc6b2f641b4f7595fead9f566682f8c512eb0",
			checkout_id: "4-d4d49ef5de45892-d6b186adb1",
			currency: "GBP",
			email: "reichert.arnaldo@example.net",
			event_time: "2021-05-07 13:50:58",
			linked_subscriptions: "6, 8, 7",
			marketing_consent: undefined,
			next_bill_date: "2021-06-02",
			passthrough: `{"teamId":"${teamId}"}`,
			quantity: 16,
			source: "Activation",
			status: "active",
			subscription_id: subscriptionId,
			subscription_plan_id: planId,
			unit_price: "unit_price",
			update_url:
				"https://checkout.paddle.com/subscription/update?user=6&subscription=5&hash=018ca7a6b63aaf4c68b7405735084788a3cdd5c6",
			user_id: "9",
			p_signature:
				"Pi/tWLioiCwtTa5HU7N29H1AEDXhfH6+YiBGzu4jxqmXOHZXWVQz0sFMkh4z3Ykp79WgChanGm6kysHk96eGGgM5cg7Y6TCXYFnwHhQdNkkQTPpNrDGbKXdJxj7JJNqa0JxTamMRIXi0o6Azdr2rOgvm+6jQ/FULtZxyqUJSlnm9UrC/QKwPpajtIMUvZy4uSUZnGQl5ynisoyazfFMN3YJ5TMDm0K5Yxx6RC0b+G5AItub900s3jjr41VYhm7svwE/jUCeeNoKT/CIrvBDgWTrqdQYVscTtiSkss9DguDA8yWx2jmzR+fobIxunH3EZ5j7dPFu8WgYtfxeeaaKyChXdl0ubjw2Jwq9PfXjClZnQj6zcEi947329oXN42/lD9FCDbiDkzIiOvOH+RNc3pbPTFfWekcHsc4GEfs2u0ahQ8SbEsLNkki+zF2kaUZrP3qGALnUeHqdSfqivwlEzrb8Qu0Kj6VZfA4zMyAGwgIi2UOFTbXpdck1VJAc0+nafGom9gqTtmqRHwaroKGNKJ7t7AIgjcHZ8I8cgM5Q+OB1i7/JF8aA/WMe4jTdprxeda1XYHCHop+lmwFcSbCc95ZTeD+A0XyGB824eBNU4VTeWfvGhrFNU94qKZXWSq29fl04XaI3hKS1fGbERJ3dz5DUyEU9KpBjSQ+h2MKdbCNw=",
		};

		mockedFindTeam.mockResolvedValueOnce(undefined);

		const { status } = await callApiHandler(subscriptionCreatedHandler, {
			method: "POST",
			body: event,
		});

		expect(status).toBe(404);
		expect(mockedCreateSubscription).toHaveBeenCalledTimes(0);
	});

	test("responds 200 to valid event", async () => {
		const teamId = "123";
		const subscriptionId = "222";
		const planId = "229";

		const event = {
			alert_id: 1789225139,
			alert_name: "subscription_created",
			cancel_url:
				"https://checkout.paddle.com/subscription/cancel?user=4&subscription=9&hash=098bc6b2f641b4f7595fead9f566682f8c512eb0",
			checkout_id: "4-d4d49ef5de45892-d6b186adb1",
			currency: "GBP",
			email: "reichert.arnaldo@example.net",
			event_time: "2021-05-07 13:50:58",
			linked_subscriptions: "6, 8, 7",
			marketing_consent: undefined,
			next_bill_date: "2021-06-02",
			passthrough: `{"teamId":"${teamId}"}`,
			quantity: 16,
			source: "Activation",
			status: "active",
			subscription_id: subscriptionId,
			subscription_plan_id: planId,
			unit_price: "unit_price",
			update_url:
				"https://checkout.paddle.com/subscription/update?user=6&subscription=5&hash=018ca7a6b63aaf4c68b7405735084788a3cdd5c6",
			user_id: "9",
			p_signature:
				"Pi/tWLioiCwtTa5HU7N29H1AEDXhfH6+YiBGzu4jxqmXOHZXWVQz0sFMkh4z3Ykp79WgChanGm6kysHk96eGGgM5cg7Y6TCXYFnwHhQdNkkQTPpNrDGbKXdJxj7JJNqa0JxTamMRIXi0o6Azdr2rOgvm+6jQ/FULtZxyqUJSlnm9UrC/QKwPpajtIMUvZy4uSUZnGQl5ynisoyazfFMN3YJ5TMDm0K5Yxx6RC0b+G5AItub900s3jjr41VYhm7svwE/jUCeeNoKT/CIrvBDgWTrqdQYVscTtiSkss9DguDA8yWx2jmzR+fobIxunH3EZ5j7dPFu8WgYtfxeeaaKyChXdl0ubjw2Jwq9PfXjClZnQj6zcEi947329oXN42/lD9FCDbiDkzIiOvOH+RNc3pbPTFfWekcHsc4GEfs2u0ahQ8SbEsLNkki+zF2kaUZrP3qGALnUeHqdSfqivwlEzrb8Qu0Kj6VZfA4zMyAGwgIi2UOFTbXpdck1VJAc0+nafGom9gqTtmqRHwaroKGNKJ7t7AIgjcHZ8I8cgM5Q+OB1i7/JF8aA/WMe4jTdprxeda1XYHCHop+lmwFcSbCc95ZTeD+A0XyGB824eBNU4VTeWfvGhrFNU94qKZXWSq29fl04XaI3hKS1fGbERJ3dz5DUyEU9KpBjSQ+h2MKdbCNw=",
		};

		mockedFindTeam.mockResolvedValueOnce({
			id: teamId,
			subscriptionId: null,
			teamMembersLimit: 1,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		const { status } = await callApiHandler(subscriptionCreatedHandler, {
			method: "POST",
			body: event,
		});

		expect(status).toBe(200);
		expect(mockedCreateSubscription).toHaveBeenCalledTimes(1);
		expect(mockedUpdateTeam).toHaveBeenCalledWith({
			id: teamId,
			subscriptionId,
			teamMembersLimit: 2,
		});
		expect(mockedSendEmail.mock.calls[0][0].recipients).toStrictEqual([
			event.email,
		]);
	});
});
