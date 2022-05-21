import type { LoaderFunction } from "@remix-run/node";
import { json } from "superjson-remix";
import { parsePhoneNumber } from "awesome-phonenumber";
import { type Message, Prisma, Direction } from "@prisma/client";

import db from "~/utils/db.server";
import { requireLoggedIn, type SessionData } from "~/utils/auth.server";

export type MessagesLoaderData = {
	user: { hasPhoneNumber: boolean };
	conversations: Record<string, Conversation> | undefined;
};

type Conversation = {
	recipient: string;
	formattedPhoneNumber: string;
	lastMessage: Message;
};

const loader: LoaderFunction = async ({ request }) => {
	const sessionData = await requireLoggedIn(request);
	return json<MessagesLoaderData>({
		user: { hasPhoneNumber: Boolean(sessionData.phoneNumber) },
		conversations: await getConversations(sessionData.phoneNumber),
	});
};

export default loader;

async function getConversations(sessionPhoneNumber: SessionData["phoneNumber"]) {
	if (!sessionPhoneNumber) {
		return;
	}

	const phoneNumber = await db.phoneNumber.findUnique({
		where: { id: sessionPhoneNumber.id },
	});
	if (!phoneNumber || phoneNumber.isFetchingMessages) {
		return;
	}

	const messages = await db.message.findMany({
		where: { phoneNumberId: phoneNumber.id },
		orderBy: { sentAt: Prisma.SortOrder.desc },
	});

	let conversations: Record<string, Conversation> = {};
	for (const message of messages) {
		let recipient: string;
		if (message.direction === Direction.Outbound) {
			recipient = message.to;
		} else {
			recipient = message.from;
		}
		const formattedPhoneNumber = parsePhoneNumber(recipient).getNumber("international");

		if (!conversations[recipient]) {
			conversations[recipient] = {
				recipient,
				formattedPhoneNumber,
				lastMessage: message,
			};
		}

		if (message.sentAt > conversations[recipient].lastMessage.sentAt) {
			conversations[recipient].lastMessage = message;
		}
		/*conversations[recipient]!.messages.push({
			...message,
			content: decrypt(message.content, organization.encryptionKey),
		});*/
	}

	return conversations;
}
