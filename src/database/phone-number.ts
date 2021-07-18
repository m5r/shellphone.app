import appLogger from "../../lib/logger";
import supabase from "../supabase/server";

const logger = appLogger.child({ module: "phone-number" });

export type PhoneNumber = {
	id: string;
	customerId: string;
	phoneNumberSid: string;
	phoneNumber: string;
};

type CreatePhoneNumberParams = Pick<PhoneNumber, "customerId" | "phoneNumber" | "phoneNumberSid">;

export async function createPhoneNumber({
	customerId,
	phoneNumber,
	phoneNumberSid,
}: CreatePhoneNumberParams): Promise<PhoneNumber> {
	const { error, data } = await supabase
		.from<PhoneNumber>("phone-number")
		.insert({
			customerId: customerId,
			phoneNumber,
			phoneNumberSid,
		});

	if (error) throw error;

	return data![0];
}

export async function findPhoneNumber({ id }: Pick<PhoneNumber, "id">): Promise<PhoneNumber> {
	const { error, data } = await supabase
		.from<PhoneNumber>("phone-number")
		.select("*")
		.eq("id", id)
		.single();

	if (error) throw error;

	return data!;
}

export async function findCustomerPhoneNumber(customerId: PhoneNumber["customerId"]): Promise<PhoneNumber> {
	const { error, data } = await supabase
		.from<PhoneNumber>("phone-number")
		.select("*")
		.eq("customerId", customerId)
		.single();

	if (error) throw error;

	return data!;
}
