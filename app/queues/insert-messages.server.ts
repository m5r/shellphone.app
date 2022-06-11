import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import { type Message, Direction } from "@prisma/client";

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
	const phoneNumber = await db.phoneNumber.findUnique({ where: { id: phoneNumberId } });
	if (!phoneNumber) {
		return;
	}

	const sms = messages
		.map<Message>((message) => {
			const status = translateMessageStatus(message.status);
			const direction = translateMessageDirection(message.direction);
			return {
				id: message.sid,
				phoneNumberId: phoneNumber.id,
				content: message.body,
				recipient: direction === Direction.Outbound ? message.to : message.from,
				from: message.from,
				to: message.to,
				status,
				direction,
				sentAt: new Date(message.dateCreated),
			};
		})
		.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

	const { count } = await db.message.createMany({ data: sms, skipDuplicates: true });
	logger.info(`inserted ${count} new messages for phoneNumberId=${phoneNumberId}`);

	if (!phoneNumber.isFetchingMessages) {
		return;
	}

	await db.phoneNumber.update({
		where: { id: phoneNumberId },
		data: { isFetchingMessages: null },
	});
});
