import { Queue } from "quirrel/blitz";
import twilio from "twilio";

import db from "../../../../db";
import insertMessagesQueue from "./insert-messages";

type Payload = {
	customerId: string;
};

const fetchMessagesQueue = Queue<Payload>("api/queue/fetch-messages", async ({ customerId }) => {
	const [customer, phoneNumber] = await Promise.all([
		db.customer.findFirst({ where: { id: customerId } }),
		db.phoneNumber.findFirst({ where: { customerId } }),
	]);
	if (!customer || !customer.accountSid || !customer.authToken || !phoneNumber) {
		return;
	}

	const [sent, received] = await Promise.all([
		twilio(customer.accountSid, customer.authToken).messages.list({ from: phoneNumber.phoneNumber }),
		twilio(customer.accountSid, customer.authToken).messages.list({ to: phoneNumber.phoneNumber }),
	]);
	const messagesSent = sent.filter((message) => message.direction.startsWith("outbound"));
	const messagesReceived = received.filter((message) => message.direction === "inbound");
	const messages = [...messagesSent, ...messagesReceived].sort(
		(a, b) => a.dateCreated.getTime() - b.dateCreated.getTime(),
	);

	await insertMessagesQueue.enqueue(
		{
			customerId,
			messages,
		},
		{
			id: `insert-messages-${customerId}`,
		},
	);
});

export default fetchMessagesQueue;
