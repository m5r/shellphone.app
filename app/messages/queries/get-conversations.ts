import { resolver, NotFoundError } from "blitz";

import db, { Direction, Message, Prisma } from "../../../db";
import getCurrentCustomer from "../../customers/queries/get-current-customer";
import { decrypt } from "../../../db/_encryption";

export default resolver.pipe(resolver.authorize(), async (_ = null, context) => {
	const customer = await getCurrentCustomer(null, context);
	if (!customer) {
		throw new NotFoundError();
	}

	const messages = await db.message.findMany({
		where: { customerId: customer.id },
		orderBy: { sentAt: Prisma.SortOrder.asc },
	});

	let conversations: Record<string, Message[]> = {};
	for (const message of messages) {
		let recipient: string;
		if (message.direction === Direction.Outbound) {
			recipient = message.to;
		} else {
			recipient = message.from;
		}

		if (!conversations[recipient]) {
			conversations[recipient] = [];
		}

		conversations[recipient]!.push({
			...message,
			content: decrypt(message.content, customer.encryptionKey),
		});

		conversations[recipient]!.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
	}
	conversations = Object.fromEntries(
		Object.entries(conversations).sort(
			([, a], [, b]) => b[b.length - 1]!.sentAt.getTime() - a[a.length - 1]!.sentAt.getTime(),
		),
	);

	return conversations;
});
