import { resolver } from "blitz";
import { z } from "zod";
import twilio from "twilio";

import db from "../../../db";
import getCurrentCustomer from "../../customers/queries/get-current-customer";
import fetchMessagesQueue from "../../messages/api/queue/fetch-messages";
import fetchCallsQueue from "../../phone-calls/api/queue/fetch-calls";
import setTwilioWebhooks from "../api/queue/set-twilio-webhooks";

const Body = z.object({
	phoneNumberSid: z.string(),
});

export default resolver.pipe(resolver.zod(Body), resolver.authorize(), async ({ phoneNumberSid }, context) => {
	const customer = await getCurrentCustomer(null, context);
	if (!customer || !customer.accountSid || !customer.authToken) {
		return;
	}

	const customerId = customer.id;
	const phoneNumbers = await twilio(customer.accountSid, customer.authToken).incomingPhoneNumbers.list();
	const phoneNumber = phoneNumbers.find((phoneNumber) => phoneNumber.sid === phoneNumberSid)!;
	await db.phoneNumber.create({
		data: {
			customerId,
			phoneNumberSid,
			phoneNumber: phoneNumber.phoneNumber,
		},
	});
	context.session.$setPrivateData({ hasCompletedOnboarding: true });

	await Promise.all([
		fetchMessagesQueue.enqueue({ customerId }, { id: `fetch-messages-${customerId}` }),
		fetchCallsQueue.enqueue({ customerId }, { id: `fetch-messages-${customerId}` }),
		setTwilioWebhooks.enqueue({ customerId }, { id: `set-twilio-webhooks-${customerId}` }),
	]);
});
