import { Queue } from "quirrel/next";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

import { findCustomer } from "../../../database/customer";
import type { Sms } from "../../../database/_types";
import { SmsType } from "../../../database/_types";
import { insertManySms } from "../../../database/sms";
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

		const sms = messages.map<Omit<Sms, "id">>(message => ({
			customerId,
			content: encrypt(message.body, encryptionKey),
			from: message.from,
			to: message.to,
			type: ["received", "receiving"].includes(message.status) ? SmsType.RECEIVED : SmsType.SENT,
			messageSid: message.sid,
			sentAt: message.dateSent.toISOString(),
		}));
		await insertManySms(sms);
	},
);

export default insertMessagesQueue;