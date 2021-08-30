import { Queue } from "quirrel/blitz";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

import db, { Message } from "../../../../db";
import { encrypt } from "../../../../db/_encryption";
import { translateMessageDirection, translateMessageStatus } from "../../../../integrations/twilio";

type Payload = {
	organizationId: string;
	phoneNumberId: string;
	messages: MessageInstance[];
};

const insertMessagesQueue = Queue<Payload>(
	"api/queue/insert-messages",
	async ({ messages, organizationId, phoneNumberId }) => {
		const phoneNumber = await db.phoneNumber.findFirst({
			where: { id: phoneNumberId, organizationId },
			include: { organization: true },
		});
		if (!phoneNumber) {
			return;
		}

		const sms = messages
			.map<Message>((message) => ({
				id: message.sid,
				organizationId,
				phoneNumberId: phoneNumber.id,
				content: encrypt(message.body, phoneNumber.organization.encryptionKey),
				from: message.from,
				to: message.to,
				status: translateMessageStatus(message.status),
				direction: translateMessageDirection(message.direction),
				sentAt: new Date(message.dateCreated),
			}))
			.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

		await db.message.createMany({ data: sms, skipDuplicates: true });
	},
);

export default insertMessagesQueue;
