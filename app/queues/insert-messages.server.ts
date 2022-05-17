import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import type { Message } from "@prisma/client";

import { Queue } from "~/utils/queue.server";
import db from "~/utils/db.server";
import { translateMessageDirection, translateMessageStatus } from "~/utils/twilio.server";
import logger from "~/utils/logger.server";

type Payload = {
	phoneNumberId: string;
	messages: MessageInstance[];
};

export default Queue<Payload>("insert messages", async ({ data }) => {
	const { messages, phoneNumberId } = data;
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { id: phoneNumberId },
		include: { organization: true },
	});
	if (!phoneNumber) {
		return;
	}

	const sms = messages
		.map<Message>((message) => ({
			id: message.sid,
			phoneNumberId: phoneNumber.id,
			content: message.body,
			from: message.from,
			to: message.to,
			status: translateMessageStatus(message.status),
			direction: translateMessageDirection(message.direction),
			sentAt: new Date(message.dateCreated),
		}))
		.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

	const { count } = await db.message.createMany({ data: sms, skipDuplicates: true });
	logger.info(`inserted ${count} new messages for phoneNumberId=${phoneNumberId}`)

	if (!phoneNumber.isFetchingMessages) {
		return;
	}

	await db.phoneNumber.update({
		where: { id: phoneNumberId },
		data: { isFetchingMessages: null },
	});
});
