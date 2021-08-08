import { Queue } from "quirrel/blitz";

import db from "../../../../db";
import insertMessagesQueue from "./insert-messages";
import getTwilioClient from "../../../../integrations/twilio";

type Payload = {
	organizationId: string;
	phoneNumberId: string;
};

const fetchMessagesQueue = Queue<Payload>("api/queue/fetch-messages", async ({ organizationId, phoneNumberId }) => {
	const phoneNumber = await db.phoneNumber.findFirst({
		where: { id: phoneNumberId, organizationId },
		include: { organization: true },
	});
	if (!phoneNumber) {
		return;
	}

	const organization = phoneNumber.organization;
	const twilioClient = getTwilioClient(organization);
	const [sent, received] = await Promise.all([
		twilioClient.messages.list({ from: phoneNumber.number }),
		twilioClient.messages.list({ to: phoneNumber.number }),
	]);
	const messagesSent = sent.filter((message) => message.direction.startsWith("outbound"));
	const messagesReceived = received.filter((message) => message.direction === "inbound");
	const messages = [...messagesSent, ...messagesReceived].sort(
		(a, b) => a.dateCreated.getTime() - b.dateCreated.getTime(),
	);

	await insertMessagesQueue.enqueue(
		{
			organizationId,
			phoneNumberId,
			messages,
		},
		{
			id: `insert-messages-${organizationId}-${phoneNumberId}`,
		},
	);
});

export default fetchMessagesQueue;
