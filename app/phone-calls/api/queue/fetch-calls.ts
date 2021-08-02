import { Queue } from "quirrel/blitz";
import twilio from "twilio";

import db from "../../../../db";
import insertCallsQueue from "./insert-calls";

type Payload = {
	customerId: string;
};

const fetchCallsQueue = Queue<Payload>("api/queue/fetch-calls", async ({ customerId }) => {
	const [customer, phoneNumber] = await Promise.all([
		db.customer.findFirst({ where: { id: customerId } }),
		db.phoneNumber.findFirst({ where: { customerId } }),
	]);
	if (!customer || !customer.accountSid || !customer.authToken || !phoneNumber) {
		return;
	}

	const [callsSent, callsReceived] = await Promise.all([
		twilio(customer.accountSid, customer.authToken).calls.list({
			from: phoneNumber.phoneNumber,
		}),
		twilio(customer.accountSid, customer.authToken).calls.list({
			to: phoneNumber.phoneNumber,
		}),
	]);
	const calls = [...callsSent, ...callsReceived].sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());

	await insertCallsQueue.enqueue(
		{
			customerId,
			calls,
		},
		{
			id: `insert-calls-${customerId}`,
		},
	);
});

export default fetchCallsQueue;
