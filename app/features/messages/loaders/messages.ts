import type { LoaderFunction } from "@remix-run/node";
import { json } from "superjson-remix";
import { parsePhoneNumber } from "awesome-phonenumber";
import { type Message, type PhoneNumber, Prisma } from "@prisma/client";

import db from "~/utils/db.server";
import { requireLoggedIn } from "~/utils/auth.server";

export type MessagesLoaderData = {
	hasPhoneNumber: boolean;
	isFetchingMessages: boolean | null;
	conversations: Conversations | undefined;
};

type Conversation = {
	recipient: string;
	formattedPhoneNumber: string;
	lastMessage: Message;
};

const loader: LoaderFunction = async ({ request }) => {
	const { twilio } = await requireLoggedIn(request);
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { twilioAccountSid_isCurrent: { twilioAccountSid: twilio?.accountSid ?? "", isCurrent: true } },
	});
	return json<MessagesLoaderData>({
		hasPhoneNumber: Boolean(phoneNumber),
		isFetchingMessages: phoneNumber?.isFetchingMessages ?? null,
		conversations: await getConversations(phoneNumber),
	});
};

export default loader;

type Conversations = Record<string, Conversation>;

async function getConversations(phoneNumber: PhoneNumber | null) {
	if (!phoneNumber) {
		return;
	}

	const messages = await db.message.findMany({
		where: { phoneNumberId: phoneNumber.id },
		orderBy: { sentAt: Prisma.SortOrder.desc },
		distinct: "recipient",
	});

	return messages.reduce<Conversations>((conversations, message) => {
		const recipient = message.recipient;
		const formattedPhoneNumber = parsePhoneNumber(recipient).getNumber("international");

		conversations[recipient] = {
			recipient,
			formattedPhoneNumber,
			lastMessage: message,
		};
		/*conversations[recipient]!.messages.push({
			...message,
			content: decrypt(message.content, organization.encryptionKey),
		});*/
		return conversations;
	}, {});
}
