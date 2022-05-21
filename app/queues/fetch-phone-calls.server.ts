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
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { id: phoneNumberId },
		include: {
			organization: {
				select: { twilioAccount: true },
			},
		},
	});
	if (!phoneNumber) {
		logger.warn(`No phone number found with id=${phoneNumberId}`);
		return;
	}

	const twilioAccount = phoneNumber.organization.twilioAccount;
	if (!twilioAccount) {
		logger.warn(`Phone number with id=${phoneNumberId} doesn't have a connected twilio account`);
		return;
	}

	const twilioClient = getTwilioClient(twilioAccount);
	const [callsSent, callsReceived] = await Promise.all([
		twilioClient.calls.list({ from: phoneNumber.number }),
		twilioClient.calls.list({ to: phoneNumber.number }),
	]);
	const calls = [...callsSent, ...callsReceived];

	await insertCallsQueue.add(`insert calls of id=${phoneNumberId}`, {
		phoneNumberId,
		calls,
	});
});
