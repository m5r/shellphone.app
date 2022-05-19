import type { LoaderFunction } from "@remix-run/node";
import { json } from "superjson-remix";
import { parsePhoneNumber } from "awesome-phonenumber";
import { type Message, Prisma, Direction, SubscriptionStatus } from "@prisma/client";

import db from "~/utils/db.server";
import { requireLoggedIn } from "~/utils/auth.server";

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
	const { id, organizations } = await requireLoggedIn(request);
	const user = await db.user.findFirst({
		where: { id },
		select: {
			id: true,
			fullName: true,
			email: true,
			role: true,
			memberships: {
				include: {
					organization: {
						include: {
							subscriptions: {
								where: {
									OR: [
										{ status: { not: SubscriptionStatus.deleted } },
										{
											status: SubscriptionStatus.deleted,
											cancellationEffectiveDate: { gt: new Date() },
										},
									],
								},
								orderBy: { lastEventTime: Prisma.SortOrder.desc },
							},
						},
					},
				},
			},
		},
	});
	const organization = user!.memberships[0].organization;
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { organizationId_isCurrent: { organizationId: organization.id, isCurrent: true } },
		select: {
			id: true,
			organizationId: true,
			number: true,
		},
	});
	const conversations = await getConversations();

	return json<MessagesLoaderData>({
		user: { hasPhoneNumber: Boolean(phoneNumber) },
		conversations,
	});

	async function getConversations() {
		const organizationId = organizations[0].id;
		const phoneNumber = await db.phoneNumber.findUnique({
			where: { organizationId_isCurrent: { organizationId, isCurrent: true } },
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
};

export default loader;
