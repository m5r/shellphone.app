import { Queue } from "quirrel/next";
import twilio from "twilio";

import { findCustomer, updateCustomer } from "../../../database/customer";
import { findCustomerPhoneNumber } from "../../../database/phone-number";

type Payload = {
	customerId: string;
}

const setTwilioWebhooks = Queue<Payload>(
	"api/queue/send-message",
	async ({ customerId }) => {
		const customer = await findCustomer(customerId);
		const twimlApp = await twilio(customer.accountSid, customer.authToken)
			.applications
			.create({
				friendlyName: "Virtual Phone",
				smsUrl: "https://phone.mokhtar.dev/api/webhook/incoming-sms",
				smsMethod: "POST",
				voiceUrl: "https://phone.mokhtar.dev/api/webhook/incoming-call",
				voiceMethod: "POST",
			});
		const twimlAppSid = twimlApp.sid;
		const { phoneNumberSid } = await findCustomerPhoneNumber(customerId);

		await Promise.all([
			updateCustomer(customerId, { twimlAppSid }),
			twilio(customer.accountSid, customer.authToken)
				.incomingPhoneNumbers
				.get(phoneNumberSid)
				.update({
					smsApplicationSid: twimlAppSid,
					voiceApplicationSid: twimlAppSid,
				}),
		]);
	},
);

export default setTwilioWebhooks;
