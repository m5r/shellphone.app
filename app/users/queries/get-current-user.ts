import { Ctx } from "blitz";

import db from "db";

export default async function getCurrentUser(_ = null, { session }: Ctx) {
	if (!session.userId) return null;

	return db.user.findFirst({
		where: { id: session.userId },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			memberships: {
				include: {
					organization: {
						select: {
							id: true,
							encryptionKey: true,
							paddleCustomerId: true,
							paddleSubscriptionId: true,
							twilioAccountSid: true,
							twilioAuthToken: true,
							twimlAppSid: true,
						},
					},
				},
			},
		},
	});
}
