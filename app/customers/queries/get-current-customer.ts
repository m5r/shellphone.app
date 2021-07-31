import { Ctx } from "blitz";

import db from "../../../db";

export default async function getCurrentCustomer(_ = null, { session }: Ctx) {
	if (!session.userId) return null;

	return db.customer.findFirst({
		where: { id: session.userId },
		select: {
			id: true,
			encryptionKey: true,
			accountSid: true,
			authToken: true,
			twimlAppSid: true,
			paddleCustomerId: true,
			paddleSubscriptionId: true,
			user: true,
		},
	});
}
