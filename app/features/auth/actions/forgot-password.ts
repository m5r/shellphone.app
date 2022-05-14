import { type ActionFunction, json } from "@remix-run/node";
import { type User, TokenType } from "@prisma/client";

import db from "~/utils/db.server";
import { type FormError, validate } from "~/utils/validation.server";
import { sendForgotPasswordEmail } from "~/mailers/forgot-password-mailer.server";
import { generateToken, hashToken } from "~/utils/token.server";
import { ForgotPassword } from "../validations";

const RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS = 24;

type ForgotPasswordFailureActionData = { errors: FormError<typeof ForgotPassword>; submitted?: never };
type ForgotPasswordSuccessfulActionData = { errors?: never; submitted: true };
export type ForgotPasswordActionData = ForgotPasswordFailureActionData | ForgotPasswordSuccessfulActionData;

const action: ActionFunction = async ({ request }) => {
	const formData = Object.fromEntries(await request.formData());
	const validation = validate(ForgotPassword, formData);
	if (validation.errors) {
		return json<ForgotPasswordFailureActionData>({ errors: validation.errors });
	}

	const { email } = validation.data;
	const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

	// always wait the same amount of time so attackers can't tell the difference whether a user is found
	await Promise.all([updatePassword(user), new Promise((resolve) => setTimeout(resolve, 750))]);

	// return the same result whether a password reset email was sent or not
	return json<ForgotPasswordSuccessfulActionData>({ submitted: true });
};

export default action;

async function updatePassword(user: User | null) {
	const membership = await db.membership.findFirst({ where: { userId: user?.id } });
	if (!user || !membership) {
		return;
	}

	const token = generateToken();
	const hashedToken = hashToken(token);
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS);

	await db.token.deleteMany({ where: { type: TokenType.RESET_PASSWORD, userId: user.id } });
	await db.token.create({
		data: {
			user: { connect: { id: user.id } },
			membership: { connect: { id: membership.id } },
			type: TokenType.RESET_PASSWORD,
			expiresAt,
			hashedToken,
			sentTo: user.email,
		},
	});

	await sendForgotPasswordEmail({
		to: user.email,
		token,
		userName: user.fullName,
	});
}
