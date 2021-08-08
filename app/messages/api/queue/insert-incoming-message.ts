import { Queue } from "quirrel/blitz";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

import db, { Direction, MessageStatus } from "../../../../db";
import { encrypt } from "../../../../db/_encryption";
import notifyIncomingMessageQueue from "./notify-incoming-message";
import getTwilioClient from "../../../../integrations/twilio";

type Payload = {
	organizationId: string;
	phoneNumberId: string;
	messageSid: MessageInstance["sid"];
};

const insertIncomingMessageQueue = Queue<Payload>(
	"api/queue/insert-incoming-message",
	async ({ messageSid, organizationId, phoneNumberId }) => {
		const organization = await db.organization.findFirst({
			where: { id: organizationId },
		});
		if (!organization) {
			return;
		}

		const twilioClient = getTwilioClient(organization);
		const message = await twilioClient.messages.get(messageSid).fetch();
		await db.message.create({
			data: {
				organizationId,
				phoneNumberId,
				id: messageSid,
				to: message.to,
				from: message.from,
				status: translateStatus(message.status),
				direction: translateDirection(message.direction),
				sentAt: message.dateCreated,
				content: encrypt(message.body, organization.encryptionKey),
			},
		});

		await notifyIncomingMessageQueue.enqueue(
			{
				messageSid,
				organizationId,
				phoneNumberId,
			},
			{ id: `notify-${messageSid}-${organizationId}-${phoneNumberId}` },
		);
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
