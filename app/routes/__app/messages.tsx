import { type LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { type Message, Prisma, Direction } from "@prisma/client";
import { parsePhoneNumber } from "awesome-phonenumber";

import PageTitle from "~/features/core/components/page-title";
import MissingTwilioCredentials from "~/features/core/components/missing-twilio-credentials";
import ConversationsList from "~/features/messages/components/conversations-list";
import db from "~/utils/db.server";
import { requireLoggedIn } from "~/utils/auth.server";

export type MessagesLoaderData = {
	user: {
		hasFilledTwilioCredentials: boolean;
		hasPhoneNumber: boolean;
	};
	conversations: Record<string, Conversation> | undefined;
};

type Conversation = {
	recipient: string;
	formattedPhoneNumber: string;
	lastMessage: Message;
};

export const loader: LoaderFunction = async ({ request }) => {
	const { id, organizations } = await requireLoggedIn(request);
	/*const user = await db.user.findFirst({
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
	const organization = user!.memberships[0]!.organization;
	const hasFilledTwilioCredentials = Boolean(organization?.twilioAccountSid && organization?.twilioAuthToken);*/
	const hasFilledTwilioCredentials = false;
	const phoneNumber = await db.phoneNumber.findFirst({
		// TODO: use the active number, not the first one
		where: { organizationId: organizations[0].id },
		select: {
			id: true,
			organizationId: true,
			number: true,
		},
	});
	const conversations = await getConversations();

	return json<MessagesLoaderData>({
		user: {
			hasFilledTwilioCredentials,
			hasPhoneNumber: Boolean(phoneNumber),
		},
		conversations,
	});

	async function getConversations() {
		if (!hasFilledTwilioCredentials) {
			return;
		}

		const organizationId = organizations[0].id;
		const organization = await db.organization.findFirst({
			where: { id: organizationId },
			include: { phoneNumbers: true },
		});
		if (!organization || !organization.phoneNumbers[0]) {
			throw new Error("Not found");
		}

		const phoneNumberId = organization.phoneNumbers[0].id; // TODO: use the active number, not the first one
		if (organization.phoneNumbers[0].isFetchingMessages) {
			return;
		}

		const messages = await db.message.findMany({
			where: { phoneNumberId },
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

			if (conversations[recipient].lastMessage.sentAt > message.sentAt) {
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

export default function MessagesPage() {
	const { user } = useLoaderData<MessagesLoaderData>();

	if (!user.hasFilledTwilioCredentials || !user.hasPhoneNumber) {
		return (
			<>
				<MissingTwilioCredentials />
				<PageTitle className="filter blur-sm select-none absolute top-0" title="Messages" />
			</>
		);
	}

	return (
		<>
			<PageTitle title="Messages" />
			<section className="flex flex-grow flex-col">
				{/* TODO: skeleton conversations list */}
				<ConversationsList />
			</section>
		</>
	);
}
