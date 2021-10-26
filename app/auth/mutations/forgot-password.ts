import { resolver, generateToken, hash256 } from "blitz";

import db, { User } from "../../../db";
import { forgotPasswordMailer } from "../../../mailers/forgot-password-mailer";
import { ForgotPassword } from "../validations";

const RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS = 24;

export default resolver.pipe(resolver.zod(ForgotPassword), async ({ email }) => {
	const user = await db.user.findFirst({ where: { email: email.toLowerCase() } });

	// always wait the same amount of time so attackers can't tell the difference whether a user is found
	await Promise.all([updatePassword(user), new Promise((resolve) => setTimeout(resolve, 750))]);

	// return the same result whether a password reset email was sent or not
	return;
});

async function updatePassword(user: User | null) {
	if (!user) {
		return;
	}

	const token = generateToken();
	const hashedToken = hash256(token);
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS);

	await db.token.deleteMany({ where: { type: "RESET_PASSWORD", userId: user.id } });
	await db.token.create({
		data: {
			user: { connect: { id: user.id } },
			type: "RESET_PASSWORD",
			expiresAt,
			hashedToken,
			sentTo: user.email,
		},
	});
	await (
		await forgotPasswordMailer({
			to: user.email,
			token,
			userName: user.fullName,
		})
	).send();
}
