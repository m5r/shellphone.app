import { Queue } from "quirrel/next";
import twilio from "twilio";

import { findCustomerPhoneNumber } from "../../../database/phone-number";
import { findCustomer } from "../../../database/customer";
import insertMessagesQueue from "./insert-messages";

type Payload = {
	customerId: string;
}

const fetchMessagesQueue = Queue<Payload>(
	"api/queue/fetch-messages",
	async ({ customerId }) => {
		const customer = await findCustomer(customerId);
		const phoneNumber = await findCustomerPhoneNumber(customerId);

		const messagesSent = await twilio(customer.accountSid, customer.authToken)
			.messages
			.list({ from: phoneNumber.phoneNumber });
		const messagesReceived = await twilio(customer.accountSid, customer.authToken)
			.messages
			.list({ to: phoneNumber.phoneNumber });
		const messages = [
			...messagesSent,
			...messagesReceived,
		].sort((a, b) => a.dateSent.getTime() - b.dateSent.getTime());

		await insertMessagesQueue.enqueue({
			customerId,
			messages,
		});
	},
);

export default fetchMessagesQueue;