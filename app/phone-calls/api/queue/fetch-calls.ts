import { Queue } from "quirrel/blitz";

import db from "../../../../db";
import insertCallsQueue from "./insert-calls";
import getTwilioClient from "../../../../integrations/twilio";

type Payload = {
	organizationId: string;
	phoneNumberId: string;
};

const fetchCallsQueue = Queue<Payload>("api/queue/fetch-calls", async ({ organizationId, phoneNumberId }) => {
	const phoneNumber = await db.phoneNumber.findFirst({
		where: { id: phoneNumberId, organizationId },
		include: { organization: true },
	});
	if (!phoneNumber) {
		console.log("no phone number found");
		return;
	}

	const organization = phoneNumber.organization;
	const twilioClient = getTwilioClient(organization);
	const [callsSent, callsReceived] = await Promise.all([
		twilioClient.calls.list({ from: phoneNumber.number }),
		twilioClient.calls.list({ to: phoneNumber.number }),
	]);
	const calls = [...callsSent, ...callsReceived].sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());

	await insertCallsQueue.enqueue(
		{
			organizationId,
			phoneNumberId,
			calls,
		},
		{
			id: `insert-calls-${organizationId}-${phoneNumberId}`,
		},
	);
});

export default fetchCallsQueue;
