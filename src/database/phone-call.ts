import type { CallStatus } from "twilio/lib/rest/api/v2010/account/call";

import appLogger from "../../lib/logger";
import supabase from "../supabase/server";

const logger = appLogger.child({ module: "phone-call" });

export type PhoneCall = {
	id: string;
	customerId: string;
	twilioSid: string;
	from: string;
	to: string;
	status: CallStatus;
	direction: "inbound" | "outbound";
	duration: string;
	createdAt: string; // timestampz
}

export async function insertPhoneCall(phoneCall: Omit<PhoneCall, "id" | "twilioSid">): Promise<PhoneCall> {
	const { error, data } = await supabase
		.from<PhoneCall>("phone-call")
		.insert(phoneCall);

	if (error) throw error;

	return data![0];
}

export async function insertManyPhoneCalls(phoneCalls: Omit<PhoneCall, "id">[]) {
	await supabase
		.from<PhoneCall>("phone-call")
		.insert(phoneCalls)
		.throwOnError();
}

export async function findCustomerPhoneCalls(customerId: PhoneCall["customerId"]): Promise<PhoneCall[]> {
	const { error, data } = await supabase
		.from<PhoneCall>("phone-call")
		.select("*")
		.eq("customerId", customerId);

	if (error) throw error;

	return data!;
}

export async function setTwilioSid({ id, twilioSid }: Pick<PhoneCall, "id" | "twilioSid">) {
	await supabase.from<PhoneCall>("phone-call")
		.update({ twilioSid })
		.eq("id", id)
		.throwOnError();
}
