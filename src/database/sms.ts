import appLogger from "../../lib/logger";
import supabase from "../supabase/server";
import type { Sms } from "./_types";
import { findCustomer } from "./customer";
import { decrypt } from "./_encryption";

const logger = appLogger.child({ module: "sms" });

export async function insertSms(messages: Omit<Sms, "id" | "twilioSid">): Promise<Sms> {
	const { error, data } = await supabase
		.from<Sms>("sms")
		.insert(messages);

	if (error) throw error;

	return data![0];
}

export async function insertManySms(messages: Omit<Sms, "id">[]) {
	await supabase
		.from<Sms>("sms")
		.insert(messages)
		.throwOnError();
}

export async function findCustomerMessages(customerId: Sms["customerId"]): Promise<Sms[]> {
	const { error, data } = await supabase
		.from<Sms>("sms")
		.select("*")
		.eq("customerId", customerId);

	if (error) throw error;

	return data!;
}

export async function findCustomerMessageBySid({ customerId, twilioSid }: Pick<Sms, "customerId" | "twilioSid">): Promise<Sms> {
	const { error, data } = await supabase
		.from<Sms>("sms")
		.select("*")
		.eq("customerId", customerId)
		.eq("twilioSid", twilioSid)
		.single();

	if (error) throw error;

	return data!;
}

export async function setTwilioSid({ id, twilioSid }: Pick<Sms, "id" | "twilioSid">) {
	await supabase.from<Sms>("sms")
		.update({ twilioSid })
		.eq("id", id)
		.throwOnError();
}

export async function findConversation(customerId: Sms["customerId"], recipient: Sms["to"]): Promise<Sms[]> {
	const customer = await findCustomer(customerId);
	const { error, data } = await supabase
		.from<Sms>("sms")
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
