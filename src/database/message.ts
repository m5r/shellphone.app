import { MessageStatus } from "twilio/lib/rest/api/v2010/account/message";

import appLogger from "../../lib/logger";
import supabase from "../supabase/server";
import { findCustomer } from "./customer";
import { decrypt } from "./_encryption";

const logger = appLogger.child({ module: "message" });

export type Message = {
	id: string;
	customerId: string;
	content: string;
	from: string;
	to: string;
	direction: "inbound" | "outbound";
	status: MessageStatus;
	twilioSid?: string;
	sentAt: string; // timestampz
};

export async function insertMessage(message: Omit<Message, "id" | "twilioSid">): Promise<Message> {
	const { error, data } = await supabase
		.from<Message>("message")
		.insert(message);

	if (error) throw error;

	return data![0];
}

export async function insertManyMessage(messages: Omit<Message, "id">[]) {
	await supabase
		.from<Message>("message")
		.insert(messages)
		.throwOnError();
}

export async function findCustomerMessages(customerId: Message["customerId"]): Promise<Message[]> {
	const { error, data } = await supabase
		.from<Message>("message")
		.select("*")
		.eq("customerId", customerId);

	if (error) throw error;

	return data!;
}

export async function findCustomerMessageBySid({ customerId, twilioSid }: Pick<Message, "customerId" | "twilioSid">): Promise<Message> {
	const { error, data } = await supabase
		.from<Message>("message")
		.select("*")
		.eq("customerId", customerId)
		.eq("twilioSid", twilioSid)
		.single();

	if (error) throw error;

	return data!;
}

export async function setTwilioSid({ id, twilioSid }: Pick<Message, "id" | "twilioSid">) {
	await supabase.from<Message>("message")
		.update({ twilioSid })
		.eq("id", id)
		.throwOnError();
}

export async function findConversation(customerId: Message["customerId"], recipient: Message["to"]): Promise<Message[]> {
	const customer = await findCustomer(customerId);
	const { error, data } = await supabase
		.from<Message>("message")
		.select("*")
		.eq("customerId", customerId)
		.or(`to.eq.${recipient},from.eq.${recipient}`);

	if (error) throw error;

	const conversation = data!.map(message => ({
		...message,
		content: decrypt(message.content, customer.encryptionKey),
	}));

	return conversation;
}
