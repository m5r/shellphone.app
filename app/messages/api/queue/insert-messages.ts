import { Queue } from "quirrel/blitz";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

import db, { Direction, Message, MessageStatus } from "../../../../db";
import { encrypt } from "../../../../db/_encryption";

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
				organizationId,
				id: message.sid,
				phoneNumberId: phoneNumber.id,
				content: encrypt(message.body, phoneNumber.organization.encryptionKey),
				from: message.from,
				to: message.to,
				status: translateStatus(message.status),
				direction: translateDirection(message.direction),
				sentAt: new Date(message.dateCreated),
			}))
			.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

		await db.message.createMany({ data: sms });
	},
);

export default insertMessagesQueue;

function translateDirection(direction: MessageInstance["direction"]): Direction {
	switch (direction) {
		case "inbound":
			return Direction.Inbound;
		case "outbound-api":
		case "outbound-call":
		case "outbound-reply":
		default:
			return Direction.Outbound;
	}
}

function translateStatus(status: MessageInstance["status"]): MessageStatus {
	switch (status) {
		case "accepted":
			return MessageStatus.Accepted;
		case "canceled":
			return MessageStatus.Canceled;
		case "delivered":
			return MessageStatus.Delivered;
		case "failed":
			return MessageStatus.Failed;
		case "partially_delivered":
			return MessageStatus.PartiallyDelivered;
		case "queued":
			return MessageStatus.Queued;
		case "read":
			return MessageStatus.Read;
		case "received":
			return MessageStatus.Received;
		case "receiving":
			return MessageStatus.Receiving;
		case "scheduled":
			return MessageStatus.Scheduled;
		case "sending":
			return MessageStatus.Sending;
		case "sent":
			return MessageStatus.Sent;
		case "undelivered":
			return MessageStatus.Undelivered;
	}
}
