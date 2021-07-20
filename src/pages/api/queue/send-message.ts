import { Queue } from "quirrel/next";
import twilio from "twilio";

import { findCustomer } from "../../../database/customer";
import { findCustomerPhoneNumber } from "../../../database/phone-number";
import { setTwilioSid } from "../../../database/sms";

type Payload = {
	id: string;
	customerId: string;
	to: string;
	content: string;
}

const sendMessageQueue = Queue<Payload>(
	"api/queue/send-message",
	async ({ id, customerId, to, content }) => {
		const customer = await findCustomer(customerId);
		const { phoneNumber } = await findCustomerPhoneNumber(customerId);
		const message = await twilio(customer.accountSid, customer.authToken)
			.messages
			.create({
				body: content,
				to,
				from: phoneNumber,
			});
		await setTwilioSid({ id, twilioSid: message.sid });
	},
	{
		retry: ["1min"],
	}
);

export default sendMessageQueue;
