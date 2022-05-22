import type { LoaderFunction } from "@remix-run/node";
import { json } from "superjson-remix";
import { parsePhoneNumber } from "awesome-phonenumber";
import { type Message, Prisma } from "@prisma/client";

import db from "~/utils/db.server";
import { requireLoggedIn } from "~/utils/auth.server";

type ConversationType = {
	recipient: string;
	formattedPhoneNumber: string;
	messages: Message[];
};

export type ConversationLoaderData = {
	conversation: ConversationType;
};

const loader: LoaderFunction = async ({ request, params }) => {
	const { organization } = await requireLoggedIn(request);
	const recipient = decodeURIComponent(params.recipient ?? "");
	const conversation = await getConversation(recipient);

	return json<ConversationLoaderData>({ conversation });

	async function getConversation(recipient: string): Promise<ConversationType> {
		const organizationId = organization.id;
		const phoneNumber = await db.phoneNumber.findUnique({
			where: { organizationId_isCurrent: { organizationId, isCurrent: true } },
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
