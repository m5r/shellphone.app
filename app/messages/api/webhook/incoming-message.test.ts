import twilio from "twilio";

import { testApiHandler } from "../../../../test/test-api-handler";
import db from "db";
import handler from "./incoming-message";
import insertIncomingMessageQueue from "../queue/insert-incoming-message";

describe("/api/webhook/incoming-message", () => {
	const mockedFindManyPhoneNumbers = db.phoneNumber.findMany as jest.Mock<ReturnType<typeof db.phoneNumber.findMany>>;
	const mockedEnqueueInsertIncomingMessage = insertIncomingMessageQueue.enqueue as jest.Mock<
		ReturnType<typeof insertIncomingMessageQueue.enqueue>
	>;
	const mockedValidateRequest = twilio.validateRequest as jest.Mock<ReturnType<typeof twilio.validateRequest>>;

	beforeEach(() => {
		mockedFindManyPhoneNumbers.mockResolvedValue([
			{
				id: "9292",
				organization: { id: "2929", twilioAuthToken: "twi" },
			} as any,
		]);
	});

	afterEach(() => {
		mockedFindManyPhoneNumbers.mockReset();
		mockedEnqueueInsertIncomingMessage.mockReset();
		mockedValidateRequest.mockReset();
	});

	it.skip("responds 200 and enqueue background jobs", async () => {
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
				expect(mockedEnqueueInsertIncomingMessage).toHaveBeenCalledTimes(1);
				expect(mockedEnqueueInsertIncomingMessage).toHaveBeenCalledWith(
					{
						messageSid: "SM157246f02006b80953e8c753fb68fad6",
						phoneNumberId: "9292",
						organizationId: "2929",
					},
					{ id: "insert-SM157246f02006b80953e8c753fb68fad6-2929-9292" },
				);
			},
		});
	});

	it.skip("responds 400 when request is invalid", async () => {
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
	phoneNumber: { findMany: jest.fn() },
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
