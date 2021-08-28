import { resolver, NotFoundError } from "blitz";
import { z } from "zod";
import PhoneNumber from "awesome-phonenumber";

import db, { Direction, Message, Prisma } from "../../../db";
import { decrypt } from "../../../db/_encryption";
import { enforceSuperAdminIfNotCurrentOrganization, setDefaultOrganizationId } from "../../core/utils";

type Conversation = {
	recipient: string;
	formattedPhoneNumber: string;
	messages: Message[];
};

export default resolver.pipe(
	resolver.zod(z.object({ organizationId: z.string().optional() })),
	resolver.authorize(),
	setDefaultOrganizationId,
	enforceSuperAdminIfNotCurrentOrganization,
	async ({ organizationId }) => {
		const organization = await db.organization.findFirst({
			where: { id: organizationId },
			include: { phoneNumbers: true },
		});
		if (!organization) {
			throw new NotFoundError();
		}

		const phoneNumberId = organization.phoneNumbers[0]!.id;
		const messages = await db.message.findMany({
			where: { organizationId, phoneNumberId },
			orderBy: { sentAt: Prisma.SortOrder.asc },
		});

		let conversations: Record<string, Conversation> = {};
		for (const message of messages) {
			let recipient: string;
			if (message.direction === Direction.Outbound) {
				recipient = message.to;
			} else {
				recipient = message.from;
			}
			const formattedPhoneNumber = new PhoneNumber(recipient).getNumber("international");

			if (!conversations[recipient]) {
				conversations[recipient] = {
					recipient,
					formattedPhoneNumber,
					messages: [],
				};
			}

			conversations[recipient]!.messages.push({
				...message,
				content: decrypt(message.content, organization.encryptionKey),
			});

			conversations[recipient]!.messages.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
		}
		conversations = Object.fromEntries(
			Object.entries(conversations).sort(
				([, a], [, b]) =>
					b.messages[b.messages.length - 1]!.sentAt.getTime() -
					a.messages[a.messages.length - 1]!.sentAt.getTime(),
			),
		);

		return conversations;
	},
);
