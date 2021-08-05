import { Queue } from "quirrel/blitz";
import twilio from "twilio";

import db from "../../../../db";
import insertMessagesQueue from "./insert-messages";

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
	if (!organization.twilioAccountSid || !organization.twilioAuthToken) {
		return;
	}

	const [sent, received] = await Promise.all([
		twilio(organization.twilioAccountSid, organization.twilioAuthToken).messages.list({ from: phoneNumber.number }),
		twilio(organization.twilioAccountSid, organization.twilioAuthToken).messages.list({ to: phoneNumber.number }),
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
