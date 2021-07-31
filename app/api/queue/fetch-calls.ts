import { Queue } from "quirrel/blitz";
import twilio from "twilio";

import db from "../../../db";
import insertCallsQueue from "./insert-calls";

type Payload = {
	customerId: string;
};

const fetchCallsQueue = Queue<Payload>("api/queue/fetch-calls", async ({ customerId }) => {
	const customer = await db.customer.findFirst({ where: { id: customerId } });
	const phoneNumber = await db.phoneNumber.findFirst({ where: { customerId } });

	const [callsSent, callsReceived] = await Promise.all([
		twilio(customer!.accountSid!, customer!.authToken!).calls.list({
			from: phoneNumber!.phoneNumber,
		}),
		twilio(customer!.accountSid!, customer!.authToken!).calls.list({
			to: phoneNumber!.phoneNumber,
		}),
	]);
	const calls = [...callsSent, ...callsReceived].sort(
		(a, b) => a.dateCreated.getTime() - b.dateCreated.getTime()
	);

	await insertCallsQueue.enqueue(
		{
			customerId,
			calls,
		},
		{
			id: `insert-calls-${customerId}`,
		}
	);
});

export default fetchCallsQueue;
