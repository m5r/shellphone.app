import type { LoaderFunction } from "@remix-run/node";
import { json } from "superjson-remix";
import { parsePhoneNumber } from "awesome-phonenumber";
import { type Message, Prisma } from "@prisma/client";

import db from "~/utils/db.server";
import { requireLoggedIn, type SessionData } from "~/utils/auth.server";

export type MessagesLoaderData = {
	user: { hasPhoneNumber: boolean };
	conversations: Conversations | undefined;
};

type Conversation = {
	recipient: string;
	formattedPhoneNumber: string;
	lastMessage: Message;
};

const loader: LoaderFunction = async ({ request }) => {
	const { phoneNumber } = await requireLoggedIn(request);
	return json<MessagesLoaderData>({
		user: { hasPhoneNumber: Boolean(phoneNumber) },
		conversations: await getConversations(phoneNumber),
	});
};

export default loader;

type Conversations = Record<string, Conversation>;

async function getConversations(sessionPhoneNumber: SessionData["phoneNumber"]) {
	if (!sessionPhoneNumber) {
		return;
	}

	const phoneNumber = await db.phoneNumber.findUnique({ where: { id: sessionPhoneNumber.id } });
	if (!phoneNumber || phoneNumber.isFetchingMessages) {
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
