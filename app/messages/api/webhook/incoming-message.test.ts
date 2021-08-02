import { testApiHandler } from "next-test-api-route-handler";
import twilio from "twilio";

import db from "db";
import handler from "./incoming-message";
import notifyIncomingMessageQueue from "../queue/notify-incoming-message";
import insertIncomingMessageQueue from "../queue/insert-incoming-message";

describe("/api/webhook/incoming-message", () => {
	const mockedFindFirstPhoneNumber = db.phoneNumber.findFirst as jest.Mock<
		ReturnType<typeof db.phoneNumber.findFirst>
	>;
	const mockedFindFirstCustomer = db.customer.findFirst as jest.Mock<ReturnType<typeof db.customer.findFirst>>;
	const mockedEnqueueNotifyIncomingMessage = notifyIncomingMessageQueue.enqueue as jest.Mock<
		ReturnType<typeof notifyIncomingMessageQueue.enqueue>
	>;
	const mockedEnqueueInsertIncomingMessage = insertIncomingMessageQueue.enqueue as jest.Mock<
		ReturnType<typeof insertIncomingMessageQueue.enqueue>
	>;
	const mockedValidateRequest = twilio.validateRequest as jest.Mock<ReturnType<typeof twilio.validateRequest>>;

	beforeEach(() => {
		mockedFindFirstPhoneNumber.mockResolvedValue({ phoneNumber: "+33757592025" } as any);
		mockedFindFirstCustomer.mockResolvedValue({ id: "9292", authToken: "twi" } as any);
	});

	afterEach(() => {
		mockedFindFirstPhoneNumber.mockReset();
		mockedFindFirstCustomer.mockReset();
		mockedEnqueueNotifyIncomingMessage.mockReset();
		mockedEnqueueInsertIncomingMessage.mockReset();
		mockedValidateRequest.mockReset();
	});

	it("responds 200 and enqueue background jobs", async () => {
		expect.hasAssertions();
		mockedValidateRequest.mockReturnValue(true);

		await testApiHandler({
			handler,
			test: async ({ fetch }) => {
				const res = await fetch({
					method: "POST",
					headers: {
						"content-type": "application/x-www-form-urlencoded",
						"x-twilio-signature": "fgZnYDKvZvb8n/Mc18x5APtOuO4=",
					},
					body: "ToCountry=FR&ToState=&SmsMessageSid=SM157246f02006b80953e8c753fb68fad6&NumMedia=0&ToCity=&FromZip=&SmsSid=SM157246f02006b80953e8c753fb68fad6&FromState=&SmsStatus=received&FromCity=&Body=cccccasdasd&FromCountry=FR&To=%2B33757592025&ToZip=&NumSegments=1&MessageSid=SM157246f02006b80953e8c753fb68fad6&AccountSid=ACa886d066be0832990d1cf43fb1d53362&From=%2B33757592722&ApiVersion=2010-04-01",
				});

				expect(res.status).toBe(200);
				expect(res.headers.get("content-type")).toBe("text/html");
				[mockedEnqueueNotifyIncomingMessage, mockedEnqueueNotifyIncomingMessage].forEach((enqueue) => {
					expect(enqueue).toHaveBeenCalledTimes(1);
					expect(enqueue).toHaveBeenCalledWith(
						{
							messageSid: "SM157246f02006b80953e8c753fb68fad6",
							customerId: "9292",
						},
						{ id: "notify-SM157246f02006b80953e8c753fb68fad6" },
					);
				});
			},
		});
	});

	it("responds 400 when request is invalid", async () => {
		expect.hasAssertions();
		mockedValidateRequest.mockReturnValue(false);

		await testApiHandler({
			handler,
			test: async ({ fetch }) => {
				const res = await fetch({
					method: "POST",
					headers: {
						"content-type": "application/x-www-form-urlencoded",
						"x-twilio-signature": "fgZnYDKvZvb8n/Mc18x5APtOuO4=",
					},
					body: "ToCountry=FR&ToState=&SmsMessageSid=SM157246f02006b80953e8c753fb68fad6&NumMedia=0&ToCity=&FromZip=&SmsSid=SM157246f02006b80953e8c753fb68fad6&FromState=&SmsStatus=received&FromCity=&Body=cccccasdasd&FromCountry=FR&To=%2B33757592025&ToZip=&NumSegments=1&MessageSid=SM157246f02006b80953e8c753fb68fad6&AccountSid=ACa886d066be0832990d1cf43fb1d53362&From=%2B33757592722&ApiVersion=2010-04-01",
				});

				expect(res.status).toBe(400);
			},
		});
	});

	it("responds 400 when twilio signature is invalid", async () => {
		expect.hasAssertions();
		mockedValidateRequest.mockReturnValue(false);

		await testApiHandler({
			handler,
			test: async ({ fetch }) => {
				const res = await fetch({
					method: "POST",
					headers: {
						"content-type": "application/x-www-form-urlencoded",
					},
					body: "ToCountry=FR&ToState=&SmsMessageSid=SM157246f02006b80953e8c753fb68fad6&NumMedia=0&ToCity=&FromZip=&SmsSid=SM157246f02006b80953e8c753fb68fad6&FromState=&SmsStatus=received&FromCity=&Body=cccccasdasd&FromCountry=FR&To=%2B33757592025&ToZip=&NumSegments=1&MessageSid=SM157246f02006b80953e8c753fb68fad6&AccountSid=ACa886d066be0832990d1cf43fb1d53362&From=%2B33757592722&ApiVersion=2010-04-01",
				});

				expect(res.status).toBe(400);
			},
		});
	});
});

jest.mock("db", () => ({
	phoneNumber: { findFirst: jest.fn() },
	customer: { findFirst: jest.fn() },
}));
jest.mock("../queue/notify-incoming-message", () => ({
	enqueue: jest.fn(),
}));
jest.mock("../queue/insert-incoming-message", () => ({
	enqueue: jest.fn(),
}));
jest.mock("twilio", () => ({ validateRequest: jest.fn() }));

// fetch({
// 	method: "POST",
// 	headers: {
// 		host: serverRuntimeConfig.app.baseUrl,
// 		"x-amzn-trace-id": "Root=1-6107d34d-0bae421100dd7a8e015e6288",
// 		"content-length": "385",
// 		"content-type": "application/x-www-form-urlencoded",
// 		"x-twilio-signature": "fgZnYDKvZvb8n/Mc18x5APtOuO4=",
// 		"i-twilio-idempotency-token": "c77ed9e8-d13e-4e9a-b46c-a39c43956f06",
// 		accept: "*/*",
// 		"user-agent": "TwilioProxy/1.1",
// 	},
// 	body: "ToCountry=FR&ToState=&SmsMessageSid=SM157246f02006b80953e8c753fb68fad6&NumMedia=0&ToCity=&FromZip=&SmsSid=SM157246f02006b80953e8c753fb68fad6&FromState=&SmsStatus=received&FromCity=&Body=cccccasdasd&FromCountry=FR&To=%2B33757592025&ToZip=&NumSegments=1&MessageSid=SM157246f02006b80953e8c753fb68fad6&AccountSid=ACa886d066be0832990d1cf43fb1d53362&From=%2B33757592722&ApiVersion=2010-04-01",
// })
