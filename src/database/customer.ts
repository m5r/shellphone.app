import appLogger from "../../lib/logger";
import supabase from "../supabase/server";
import { computeEncryptionKey } from "./_encryption";
import { findPhoneNumber } from "./phone-number";

const logger = appLogger.child({ module: "customer" });

export type Customer = {
	id: string;
	email: string;
	name: string;
	encryptionKey: string;
	accountSid?: string;
	authToken?: string; // TODO: should encrypt it
	twimlAppSid?: string;
	paddleCustomerId?: string;
	paddleSubscriptionId?: string;
};

type CreateCustomerParams = Pick<Customer, "id" | "email" | "name">;

export async function createCustomer({ id, email, name }: CreateCustomerParams): Promise<Customer> {
	const encryptionKey = computeEncryptionKey(id).toString("hex");
	const { error, data } = await supabase
		.from<Customer>("customer")
		.insert({
			id,
			email,
			name,
			encryptionKey,
		});

	if (error) throw error;

	return data![0];
}

export async function findCustomer(id: Customer["id"]): Promise<Customer> {
	const { error, data } = await supabase
		.from<Customer>("customer")
		.select("*")
		.eq("id", id)
		.single();

	if (error) throw error;

	return data!;
}

export async function findCustomerByPhoneNumber(phoneNumber: string): Promise<Customer> {
	const { customerId } = await findPhoneNumber(phoneNumber);
	const { error, data } = await supabase
		.from<Customer>("customer")
		.select("*")
		.eq("id", customerId)
		.single();

	if (error) throw error;

	return data!;
}

export async function updateCustomer(id: string, update: Partial<Customer>) {
	await supabase.from<Customer>("customer")
		.update(update)
		.eq("id", id)
		.throwOnError();
}
