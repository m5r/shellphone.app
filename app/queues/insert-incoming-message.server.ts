import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import { Direction } from "@prisma/client";

import { Queue } from "~/utils/queue.server";
import db from "~/utils/db.server";
import getTwilioClient, { translateMessageDirection, translateMessageStatus } from "~/utils/twilio.server";
import logger from "~/utils/logger.server";

type Payload = {
	phoneNumberId: string;
	messageSid: MessageInstance["sid"];
};

export default Queue<Payload>("insert incoming message", async ({ data }) => {
	const { messageSid, phoneNumberId } = data;
	logger.info(`received message ${messageSid} for ${phoneNumberId}`);
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
	const message = await twilioClient.messages.get(messageSid).fetch();
	const status = translateMessageStatus(message.status);
	const direction = translateMessageDirection(message.direction);
	await db.message.create({
		data: {
			phoneNumberId,
			id: messageSid,
			recipient: direction === Direction.Outbound ? message.to : message.from,
			to: message.to,
			from: message.from,
			status,
			direction,
			sentAt: new Date(message.dateCreated),
			content: message.body,
		},
	});

	/*await notifyIncomingMessageQueue.enqueue(
		{
			messageSid,
			phoneNumberId,
		},
		{ id: `notify-${messageSid}-${organizationId}-${phoneNumberId}` },
	);*/
});
