import type { LoaderFunction } from "@remix-run/node";
import { json } from "superjson-remix";
import { parsePhoneNumber } from "awesome-phonenumber";
import { type Message, type PhoneNumber, Prisma } from "@prisma/client";

import db from "~/utils/db.server";
import { redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";

type ConversationType = {
	recipient: string;
	formattedPhoneNumber: string;
	messages: Message[];
};

export type ConversationLoaderData = {
	conversation: ConversationType;
	currentPhoneNumber: Pick<PhoneNumber, "id" | "number">;
};

const loader: LoaderFunction = async ({ request, params }) => {
	const session = await getSession(request);
	const twilio = session.get("twilio");
	if (!twilio) {
		return redirect("/messages");
	}

	const twilioAccountSid = twilio.accountSid;
	const currentPhoneNumber = await db.phoneNumber.findUnique({
		where: {
			twilioAccountSid_isCurrent: {
				twilioAccountSid,
				isCurrent: true,
			},
		},
		select: {
			id: true,
			number: true,
		},
	});
	if (!currentPhoneNumber) {
		return redirect("/messages");
	}

	const recipient = decodeURIComponent(params.recipient ?? "");
	const conversation = await getConversation(recipient);

	return json<ConversationLoaderData>({ conversation, currentPhoneNumber });

	async function getConversation(recipient: string): Promise<ConversationType> {
		const phoneNumber = await db.phoneNumber.findUnique({
			where: { twilioAccountSid_isCurrent: { twilioAccountSid, isCurrent: true } },
		});
		if (!phoneNumber || phoneNumber.isFetchingMessages) {
			throw new Error("unreachable");
		}

		const formattedPhoneNumber = parsePhoneNumber(recipient).getNumber("international");
		const messages = await db.message.findMany({
			where: {
				phoneNumberId: phoneNumber.id,
				OR: [{ from: recipient }, { to: recipient }],
			},
			orderBy: { sentAt: Prisma.SortOrder.asc },
		});
		return {
			recipient,
			formattedPhoneNumber,
			messages,
		};
	}
};

export default loader;
