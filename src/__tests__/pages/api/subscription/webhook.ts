jest.mock(
	"../../../../pages/api/subscription/_subscription-payment-succeeded",
	() => ({
		subscriptionPaymentSucceededHandler: jest.fn(),
	}),
);

import type { NextApiResponse } from "next";

import { subscriptionPaymentSucceededHandler } from "../../../../pages/api/subscription/_subscription-payment-succeeded";
import { callApiHandler } from "../../../../../jest/helpers";
import webhookHandler from "../../../../pages/api/subscription/webhook";

describe("/api/subscription/webhook", () => {
	const mockedSubscriptionPaymentSucceededHandler = subscriptionPaymentSucceededHandler as jest.Mock<
		ReturnType<typeof subscriptionPaymentSucceededHandler>
	>;
	mockedSubscriptionPaymentSucceededHandler.mockImplementation(
		async (_, res: NextApiResponse) => res.status(200).end(),
	);

	beforeEach(() => {
		mockedSubscriptionPaymentSucceededHandler.mockClear();
	});

	test("responds 405 to GET", async () => {
		const { status } = await callApiHandler(webhookHandler, {
			method: "GET",
		});
		expect(status).toBe(405);
	});

	test("responds 500 to POST with invalid webhook event", async () => {
		const response = await callApiHandler(webhookHandler, {
			method: "POST",
			body: {},
		});
		expect(response.status).toBe(500);
	});

	test("responds 400 to POST with unsupported webhook event", async () => {
		const response = await callApiHandler(webhookHandler, {
			method: "POST",
			body: payoutPaid,
		});
		expect(response.status).toBe(400);
	});

	test("responds 200 to POST with supported and valid webhook event", async () => {
		const response = await callApiHandler(webhookHandler, {
			method: "POST",
			body: subscriptionPaymentSucceeded,
		});
		expect(response.status).toBe(200);
		expect(mockedSubscriptionPaymentSucceededHandler).toHaveBeenCalledTimes(
			1,
		);
	});
});

const payoutPaid = {
	alert_id: 833499511,
	alert_name: "transfer_paid",
	amount: 648.8,
	currency: "USD",
	event_time: "2021-05-07 00:29:50",
	payout_id: 6,
	status: "paid",
	p_signature:
		"p5AwTrjZPgczHkU8CHiUc7VH1mn8FLH+s+JUaNqrlY7xhaD+KG2Aq6njnwH4Q+xGN51pwpFZDpjBI6EZIsYlP/Rs3GWObJU7I2xOpvLXIrvjMDeIgNVL2s+BWeqqzylFYGsH1uKHQIFa5fm/JiUEErHecoNyk3GcwP7j2qeiHra64i+mjhzKsprUd4NUlhxD7nEpfRpM7aMuMii7WE/EGBBW12bxiJCRcrm0yuSrDLTZCbiOnK6ddPqsYrSPjWJjSOFXblQK+erOTuvOZuRaf5eiZodbiOyeGsgZ/AhfqXiWt0bOpbuqgMkofUJSgz5AV3y3HgqxhhsrXCTRgdexr/6Cx7+k1mm2AWMhuTn3DU3+2eDkiNIeP52hPtjx6h/Kxbb7/OoxYB9rfDT42m553nPbWxdSGw6Zz5h2oWOH0goFAFMi9CSXS+HilXpmKWc2KjIFYyu8Yu+3lZ2KAMWPwDEc8liQsWZVSo/R4SXcd3t5p+k3uhFwRkwIoeF7If25MQADEBK1s84p5tZTgo4EPkqEwRYZdRiTBZ+xzrrEOvsAA192hEXcjWRnFlqYeMITY/j2rf/ZTlXXbLw1Bcje1vr27z3Qe64GP4m4Whrh37N0kOkSElMXnCMx8fj3WgyMyHZhKGE96t+sfuA1NJy/dGl968uJIz1XVWh9F+6fcGo=",
};

const subscriptionPaymentSucceeded = {
	alert_id: 1667920177,
	alert_name: "subscription_payment_succeeded",
	balance_currency: "USD",
	balance_earnings: 791.71,
	balance_fee: 774.49,
	balance_gross: 102.03,
	balance_tax: 282.55,
	checkout_id: "4-599cbbe6fe49dc0-4c628740d6",
	country: "DE",
	coupon: "Coupon 5",
	currency: "USD",
	customer_name: "customer_name",
	earnings: 253.39,
	email: "baron.daugherty@example.org",
	event_time: "2021-05-07 00:18:15",
	fee: 0.11,
	initial_payment: true,
	instalments: 6,
	marketing_consent: 1,
	next_bill_date: "2021-05-23",
	next_payment_amount: "next_payment_amount",
	order_id: 7,
	passthrough: "Example String",
	payment_method: "card",
	payment_tax: 0.69,
	plan_name: "Example String",
	quantity: 62,
	receipt_url: "https://my.paddle.com/receipt/1/a18b96518813baa-a470ddf641",
	sale_gross: 556.08,
	status: "trialing",
	subscription_id: 3,
	subscription_payment_id: 4,
	subscription_plan_id: 9,
	unit_price: "unit_price",
	user_id: 5,
	p_signature:
		"eucBVrNR/4KySSm+sSGwcBcaCXXZFEyTi4OY0nCxAEeGAc3QaBpGI8r+Ma3J4i7XmKOSYxalDx2nuXB2igqomg9YPQirmcgFOECX8NFDLvZeu3/V7SYuEeGHLmjZFyOSK8htwGVheTzQiFGbGq8ALPD1vgb0CME2iulfLC7kiRGut8enpLWUGSXlzXP0AVvxWkS7MyT0EQEE+b62EDEavyds2YaS7/tWQVoKBuHeWm7JqjdbEg4b+ht7ev9ns2RgyGNxsRs3+w9rpL8uAIzib7m24aWqqfBoB2kMhJvM6csfgqDZ6gF3nOG2PE1VJzD4G2Y0RJsZPC3BboQmE//RIS1UdyxKEwGHi8cDPIJIIzn31xx42uJulyX69w0JihBnTfasuEXy9gZKB96XCsMmks9nBQZAi+ZNteBfT7unToXLMwHn0mPDTUj+NpEWjTdIUCL6JM4Ewk3cDTs9tleo0TAXxikk06YnjJbGxL7mEwofB31rFlUyzmkKtf935TMGGe4cbhBdGcLaImithNyo48mWQvTg8F2yvIa6vZ3rmbGL6oNe3GT8q7r+HBLdatv5uDoomboZqh7dsNEmpv6VwJtmeNEoQs8//VD/MCcLFPaKCZp8QmYBwvYXdVunxSwwCF6rwEm77U8Jo/2Ua7giCQj+ekkgJ7uE4ubo10lB5bE=",
};
