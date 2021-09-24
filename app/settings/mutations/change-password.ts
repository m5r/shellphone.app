import { AuthenticationError, NotFoundError, resolver, SecurePassword } from "blitz";
import { z } from "zod";

import db from "../../../db";
import { authenticateUser } from "../../auth/mutations/login";
import { password } from "../../auth/validations";

const Body = z.object({
	currentPassword: z.string(),
	newPassword: password,
});

export default resolver.pipe(
	resolver.zod(Body),
	resolver.authorize(),
	async ({ currentPassword, newPassword }, ctx) => {
		const user = await db.user.findFirst({ where: { id: ctx.session.userId! } });
		if (!user) throw new NotFoundError();

		try {
			await authenticateUser(user.email, currentPassword);
		} catch (error) {
			if (error instanceof AuthenticationError) {
				throw new Error("Current password is incorrect");
			}

			throw error;
		}

		const hashedPassword = await SecurePassword.hash(newPassword.trim());
		await db.user.update({
			where: { id: user.id },
			data: { hashedPassword },
		});
	},
);
