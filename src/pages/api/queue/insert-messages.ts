import { Queue } from "quirrel/next";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

import { findCustomer } from "../../../database/customer";
import type { Message } from "../../../database/message";
import { insertManyMessage } from "../../../database/message";
import { encrypt } from "../../../database/_encryption";

type Payload = {
	customerId: string;
	messages: MessageInstance[];
}

const insertMessagesQueue = Queue<Payload>(
	"api/queue/insert-messages",
	async ({ messages, customerId }) => {
		const customer = await findCustomer(customerId);
		const encryptionKey = customer.encryptionKey;

		const sms = messages
			.map<Omit<Message, "id">>(message => ({
				customerId,
				content: encrypt(message.body, encryptionKey),
				from: message.from,
				to: message.to,
				status: message.status,
				direction: message.direction === "inbound" ? "inbound" : "outbound",
				twilioSid: message.sid,
				sentAt: new Date(message.dateSent).toISOString(),
			}))
			.sort((a, b) => a.sentAt.localeCompare(b.sentAt));

		await insertManyMessage(sms);
	},
);

export default insertMessagesQueue;