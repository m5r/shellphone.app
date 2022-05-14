import { type ActionFunction, json, redirect } from "@remix-run/node";
import { TokenType } from "@prisma/client";

import db from "~/utils/db.server";
import logger from "~/utils/logger.server";
import { type FormError, validate } from "~/utils/validation.server";
import { authenticate, hashPassword } from "~/utils/auth.server";
import { ResetPasswordError } from "~/utils/errors";
import { hashToken } from "~/utils/token.server";
import { ResetPassword } from "../validations";

export type ResetPasswordActionData = { errors: FormError<typeof ResetPassword> };

const action: ActionFunction = async ({ request }) => {
	const searchParams = new URL(request.url).searchParams;
	const token = searchParams.get("token");
	if (!token) {
		return redirect("/forgot-password");
	}

	const formData = Object.fromEntries(await request.formData());
	const validation = validate(ResetPassword, { ...formData, token });
	if (validation.errors) {
		return json<ResetPasswordActionData>({ errors: validation.errors });
	}

	const hashedToken = hashToken(token);
	const savedToken = await db.token.findFirst({
		where: { hashedToken, type: TokenType.RESET_PASSWORD },
		include: { user: true },
	});
	if (!savedToken) {
		logger.warn(`No token found with hashedToken=${hashedToken}`);
		throw new ResetPasswordError();
	}

	await db.token.delete({ where: { id: savedToken.id } });

	if (savedToken.expiresAt < new Date()) {
		logger.warn(`Token with hashedToken=${hashedToken} is expired since ${savedToken.expiresAt.toUTCString()}`);
		throw new ResetPasswordError();
	}

	const password = validation.data.password.trim();
	const hashedPassword = await hashPassword(password);
	const { email } = await db.user.update({
		where: { id: savedToken.userId },
		data: { hashedPassword },
	});

	await db.session.deleteMany({ where: { userId: savedToken.userId } });

	return authenticate({ email, password, request });
};

export default action;
