import { Queue } from "~/utils/queue.server";
import db from "~/utils/db.server";
import logger from "~/utils/logger.server";
import getTwilioClient from "~/utils/twilio.server";
import insertCallsQueue from "./insert-phone-calls.server";

type Payload = {
	phoneNumberId: string;
};

export default Queue<Payload>("fetch phone calls", async ({ data }) => {
	const { phoneNumberId } = data;
	logger.info(`Fetching phone calls for phone number with id=${phoneNumberId}`);
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { id: phoneNumberId },
		include: { twilioAccount: true },
	});
	if (!phoneNumber) {
		logger.warn(`No phone number found with id=${phoneNumberId}`);
		return;
	}

	const twilioClient = getTwilioClient(phoneNumber.twilioAccount);
	const [callsSent, callsReceived] = await Promise.all([
		twilioClient.calls.list({ from: phoneNumber.number }),
		twilioClient.calls.list({ to: phoneNumber.number }),
	]);
	logger.info(
		`Found ${callsSent.length} outbound calls and ${callsReceived.length} inbound calls for phone number with id=${phoneNumberId}`,
	);

	const calls = [...callsSent, ...callsReceived];
	await insertCallsQueue.add(`insert calls of id=${phoneNumberId}`, {
		phoneNumberId,
		calls,
	});
});
