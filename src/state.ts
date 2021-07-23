import { atom } from "jotai";
import type { Message } from "./database/message";
import type { Customer } from "./database/customer";
import type { PhoneCall } from "./database/phone-call";
import type { PhoneNumber } from "./database/phone-number";
import { decrypt } from "./database/_encryption";

type Recipient = string;

export const customerAtom = atom<Customer | null>(null);
export const customerPhoneNumberAtom = atom<PhoneNumber | null>(null);

export const messagesAtom = atom<Message[] | null>(null);
export const conversationsAtom = atom<Record<Recipient, Message[]>>(
	(get) => {
		const messages = get(messagesAtom);
		const customer = get(customerAtom);
		if (!customer || !messages) {
			return {};
		}

		let conversations: Record<Recipient, Message[]> = {};
		for (const message of messages) {
			let recipient: string;
			if (message.direction === "outbound") {
				recipient = message.to;
			} else {
				recipient = message.from;
			}

			if (!conversations[recipient]) {
				conversations[recipient] = [];
			}

			conversations[recipient].push({
				...message,
				content: decrypt(message.content, customer.encryptionKey),
			});

			conversations[recipient].sort((a, b) => a.sentAt.localeCompare(b.sentAt));
		}
		conversations = Object.fromEntries(
			Object.entries(conversations).sort(([,a], [,b]) => b[b.length - 1].sentAt.localeCompare(a[a.length - 1].sentAt))
		);

		return conversations;
	},
);

export const phoneCallsAtom = atom<PhoneCall[] | null>(null);
