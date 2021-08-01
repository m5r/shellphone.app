import { Queue } from "quirrel/blitz";
import twilio from "twilio";

import db from "../../../db";
import insertMessagesQueue from "./insert-messages";

type Payload = {
	customerId: string;
};

const fetchMessagesQueue = Queue<Payload>("api/queue/fetch-messages", async ({ customerId }) => {
	const customer = await db.customer.findFirst({ where: { id: customerId } });
	const phoneNumber = await db.phoneNumber.findFirst({ where: { customerId } });

	const [messagesSent, messagesReceived] = await Promise.all([
		twilio(customer!.accountSid!, customer!.authToken!).messages.list({
			from: phoneNumber!.phoneNumber,
		}),
		twilio(customer!.accountSid!, customer!.authToken!).messages.list({
			to: phoneNumber!.phoneNumber,
		}),
	]);
	const messages = [...messagesSent, ...messagesReceived].sort(
		(a, b) => a.dateCreated.getTime() - b.dateCreated.getTime()
	);

	await insertMessagesQueue.enqueue(
		{
			customerId,
			messages,
		},
		{
			id: `insert-messages-${customerId}`,
		}
	);
});

export default fetchMessagesQueue;
