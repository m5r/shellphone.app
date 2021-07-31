import { Queue } from "quirrel/blitz";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

import db, { MessageStatus, Direction, Message } from "../../../db";
import { encrypt } from "../../../db/_encryption";

type Payload = {
	customerId: string;
	messages: MessageInstance[];
};

const insertMessagesQueue = Queue<Payload>(
	"api/queue/insert-messages",
	async ({ messages, customerId }) => {
		const customer = await db.customer.findFirst({ where: { id: customerId } });
		const encryptionKey = customer!.encryptionKey;

		const sms = messages
			.map<Omit<Message, "id">>((message) => ({
				customerId,
				content: encrypt(message.body, encryptionKey),
				from: message.from,
				to: message.to,
				status: translateStatus(message.status),
				direction: translateDirection(message.direction),
				twilioSid: message.sid,
				sentAt: new Date(message.dateSent),
			}))
			.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());

		await db.message.createMany({ data: sms });
	}
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
