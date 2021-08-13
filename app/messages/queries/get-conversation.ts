import { NotFoundError, resolver } from "blitz";
import { z } from "zod";

import db, { Prisma } from "../../../db";
import { decrypt } from "../../../db/_encryption";

const GetConversations = z.object({
	recipient: z.string(),
});

export default resolver.pipe(resolver.zod(GetConversations), resolver.authorize(), async ({ recipient }, context) => {
	const organization = await db.organization.findFirst({ where: { id: context.session.orgId } });
	if (!organization) {
		throw new NotFoundError();
	}

	const conversation = await db.message.findMany({
		where: { OR: [{ from: recipient }, { to: recipient }] },
		orderBy: { sentAt: Prisma.SortOrder.desc },
	});

	return conversation.map((message) => {
		return {
			...message,
			content: decrypt(message.content, organization.encryptionKey),
		};
	});
});
