import { resolver } from "blitz";
import { z } from "zod";

import db, { Prisma } from "../../../db";
import { decrypt } from "../../../db/_encryption";
import getCurrentCustomer from "../../customers/queries/get-current-customer";

const GetConversations = z.object({
	recipient: z.string(),
});

export default resolver.pipe(
	resolver.zod(GetConversations),
	resolver.authorize(),
	async ({ recipient }, context) => {
		const customer = await getCurrentCustomer(null, context);
		const conversation = await db.message.findMany({
			where: {
				OR: [{ from: recipient }, { to: recipient }],
			},
			orderBy: { sentAt: Prisma.SortOrder.asc },
		});

		return conversation.map((message) => {
			return {
				...message,
				content: decrypt(message.content, customer!.encryptionKey),
			};
		});
	}
);
