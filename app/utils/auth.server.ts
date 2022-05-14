import { type Session, redirect } from "@remix-run/node";
import type { FormStrategyVerifyParams } from "remix-auth-form";
import SecurePassword from "secure-password";
import type { MembershipRole, Organization, User } from "@prisma/client";

import db from "./db.server";
import logger from "./logger.server";
import authenticator from "./authenticator.server";
import { AuthenticationError } from "./errors";
import { commitSession, destroySession, getSession } from "./session.server";

export type SessionOrganization = Pick<Organization, "id"> & { role: MembershipRole };
export type SessionUser = Omit<User, "hashedPassword"> & {
	organizations: SessionOrganization[];
};

const SP = new SecurePassword();

export async function login({ form }: FormStrategyVerifyParams): Promise<SessionUser> {
	const email = form.get("email");
	const password = form.get("password");
	const isEmailValid = typeof email === "string" && email.length > 0;
	const isPasswordValid = typeof password === "string" && password.length > 0;

	if (!isEmailValid && !isPasswordValid) {
		throw new AuthenticationError("Email and password are required");
	}
	if (!isEmailValid) {
		throw new AuthenticationError("Email is required");
	}
	if (!isPasswordValid) {
		throw new AuthenticationError("Password is required");
	}

	const user = await db.user.findUnique({
		where: { email: email.toLowerCase() },
		include: {
			memberships: {
				select: {
					organization: {
						select: { id: true },
					},
					role: true,
				},
			},
		},
	});
	if (!user || !user.hashedPassword) {
		logger.warn(`User with email=${email.toLowerCase()} not found`);
		throw new AuthenticationError("Incorrect password");
	}

	switch (await verifyPassword(user.hashedPassword, password)) {
		case SecurePassword.VALID:
			break;
		case SecurePassword.VALID_NEEDS_REHASH:
			// Upgrade hashed password with a more secure hash
			const improvedHash = await hashPassword(password);
			await db.user.update({ where: { id: user.id }, data: { hashedPassword: improvedHash } });
			break;
		default:
			logger.warn(`Tried to log into account with email=${email.toLowerCase()} with an incorrect password`);
			throw new AuthenticationError("Incorrect password");
	}

	const { hashedPassword, memberships, ...rest } = user;
	const organizations = memberships.map((membership) => ({
		...membership.organization,
		role: membership.role,
	}));

	return {
		...rest,
		organizations,
	};
}

export async function verifyPassword(hashedPassword: string, password: string) {
	try {
		return await SP.verify(Buffer.from(password), Buffer.from(hashedPassword, "base64"));
	} catch (error) {
		logger.error(error);
		return false;
	}
}

export async function hashPassword(password: string) {
	const hashedBuffer = await SP.hash(Buffer.from(password));
	return hashedBuffer.toString("base64");
}

type AuthenticateParams = {
	email: string;
	password: string;
	request: Request;
	successRedirect?: string | null;
	failureRedirect?: string;
};

export async function authenticate({
	email,
	password,
	request,
	successRedirect,
	failureRedirect = "/sign-in",
}: AuthenticateParams) {
	const body = new URLSearchParams({ email, password });
	const signInRequest = new Request(request.url, {
		body,
		method: "post",
		headers: request.headers,
	});
	const user = await authenticator.authenticate("email-password", signInRequest, { failureRedirect });
	const session = await getSession(request);
	session.set(authenticator.sessionKey, user);
	const redirectTo = successRedirect ?? "/messages";
	return redirect(redirectTo, {
		headers: { "Set-Cookie": await commitSession(session) },
	});
}

export function getErrorMessage(session: Session) {
	const authError = session.get(authenticator.sessionErrorKey || "auth:error");
	return authError?.message;
}

export async function requireLoggedOut(request: Request) {
	const user = await authenticator.isAuthenticated(request);
	if (user) {
		throw redirect("/messages");
	}
}

export async function requireLoggedIn(request: Request) {
	const user = await authenticator.isAuthenticated(request);
	if (!user) {
		throw redirect("/sign-in", {
			headers: { "Set-Cookie": await destroySession(await getSession(request)) },
		});
	}

	return user;
}

export async function refreshSessionData(request: Request) {
	const { id } = await requireLoggedIn(request);
	const user = await db.user.findUnique({
		where: { id },
		include: {
			memberships: {
				select: {
					organization: {
						select: { id: true },
					},
					role: true,
				},
			},
		},
	});
	if (!user || !user.hashedPassword) {
		logger.warn(`User with id=${id} not found`);
		throw new AuthenticationError("Could not refresh session, user does not exist");
	}

	const { hashedPassword, memberships, ...rest } = user;
	const organizations = memberships.map((membership) => ({
		...membership.organization,
		role: membership.role,
	}));
	const sessionUser: SessionUser = {
		...rest,
		organizations,
	};
	const session = await getSession(request);
	session.set(authenticator.sessionKey, sessionUser);

	return { session, user: sessionUser };
}
