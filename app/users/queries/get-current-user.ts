import type { Ctx } from "blitz";

import db from "db";

export default async function getCurrentUser(_ = null, { session }: Ctx) {
	if (!session.userId) return null;

	return db.user.findFirst({
		where: { id: session.userId },
		select: {
			id: true,
			fullName: true,
			email: true,
			role: true,
			memberships: {
				include: {
					organization: {
						select: {
							id: true,
							encryptionKey: true,
							twilioAccountSid: true,
							twilioAuthToken: true,
							twilioApiKey: true,
							twilioApiSecret: true,
							twimlAppSid: true,
						},
					},
				},
			},
		},
	});
}
