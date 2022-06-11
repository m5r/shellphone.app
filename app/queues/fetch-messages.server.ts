import { Queue } from "~/utils/queue.server";
import db from "~/utils/db.server";
import logger from "~/utils/logger.server";
import getTwilioClient from "~/utils/twilio.server";
import insertMessagesQueue from "./insert-messages.server";

type Payload = {
	phoneNumberId: string;
};

export default Queue<Payload>("fetch messages", async ({ data }) => {
	const { phoneNumberId } = data;
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { id: phoneNumberId },
		include: { twilioAccount: true },
	});
	if (!phoneNumber) {
		logger.warn(`No phone number found with id=${phoneNumberId}`);
		return;
	}

	const twilioClient = getTwilioClient(phoneNumber.twilioAccount);
	const [sent, received] = await Promise.all([
		twilioClient.messages.list({ from: phoneNumber.number }),
		twilioClient.messages.list({ to: phoneNumber.number }),
	]);
	const messagesSent = sent.filter((message) => message.direction.startsWith("outbound"));
	const messagesReceived = received.filter((message) => message.direction === "inbound");
	const messages = [...messagesSent, ...messagesReceived];

	await insertMessagesQueue.add(`insert messages of id=${phoneNumberId}`, {
		phoneNumberId,
		messages,
	});
});
