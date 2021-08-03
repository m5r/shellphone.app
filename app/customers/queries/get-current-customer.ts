import { resolver } from "blitz";

import db from "../../../db";

export default resolver.pipe(resolver.authorize(), async (_ = null, { session }) => {
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
});
