import { Queue } from "quirrel/blitz";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import twilio from "twilio";

import db, { Direction, MessageStatus } from "../../../../db";
import { encrypt } from "../../../../db/_encryption";

type Payload = {
	customerId: string;
	messageSid: MessageInstance["sid"];
};

const insertIncomingMessageQueue = Queue<Payload>(
	"api/queue/insert-incoming-message",
	async ({ messageSid, customerId }) => {
		const customer = await db.customer.findFirst({ where: { id: customerId } });
		if (!customer || !customer.accountSid || !customer.authToken) {
			return;
		}

		const encryptionKey = customer.encryptionKey;
		const message = await twilio(customer.accountSid, customer.authToken).messages.get(messageSid).fetch();
		await db.message.create({
			data: {
				customerId,
				to: message.to,
				from: message.from,
				status: translateStatus(message.status),
				direction: translateDirection(message.direction),
				sentAt: message.dateCreated,
				content: encrypt(message.body, customer.encryptionKey),
			},
		});

		await db.message.createMany({
			data: {
				customerId,
				content: encrypt(message.body, encryptionKey),
				from: message.from,
				to: message.to,
				status: translateStatus(message.status),
				direction: translateDirection(message.direction),
				twilioSid: message.sid,
				sentAt: new Date(message.dateCreated),
			},
		});
	},
);

export default insertIncomingMessageQueue;

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
