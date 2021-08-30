import { Queue } from "quirrel/blitz";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

import db from "../../../../db";
import { encrypt } from "../../../../db/_encryption";
import notifyIncomingMessageQueue from "./notify-incoming-message";
import getTwilioClient, { translateMessageDirection, translateMessageStatus } from "../../../../integrations/twilio";

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
				status: translateMessageStatus(message.status),
				direction: translateMessageDirection(message.direction),
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
