import { redirect, type Session } from "@remix-run/node";
import type { FormStrategyVerifyParams } from "remix-auth-form";
import SecurePassword from "secure-password";
import type { MembershipRole, Organization, PhoneNumber, TwilioAccount, User } from "@prisma/client";

import db from "./db.server";
import logger from "./logger.server";
import authenticator from "./authenticator.server";
import { AuthenticationError, NotFoundError } from "./errors";
import { commitSession, destroySession, getSession } from "./session.server";

type SessionTwilioAccount = Pick<TwilioAccount, "accountSid" | "authToken">;
type SessionOrganization = Pick<Organization, "id"> & { role: MembershipRole; membershipId: string };
type SessionPhoneNumber = Pick<PhoneNumber, "id" | "number">;
export type SessionUser = Pick<User, "id" | "role" | "email" | "fullName">;
export type SessionData = {
	user: SessionUser;
	organization: SessionOrganization;
	phoneNumber: SessionPhoneNumber | null;
	twilio: SessionTwilioAccount | null;
};

const SP = new SecurePassword();

export async function login({ form }: FormStrategyVerifyParams): Promise<SessionData> {
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

	const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
	if (!user || !user.hashedPassword) {
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

	try {
		return await buildSessionData(user.id);
	} catch (error: any) {
		logger.error(error);
		if (error instanceof AuthenticationError) {
			throw error;
		}

		throw new AuthenticationError("Incorrect password");
	}
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
	const sessionData = await authenticator.authenticate("email-password", signInRequest, { failureRedirect });
	const session = await getSession(request);
	session.set(authenticator.sessionKey, sessionData);
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
		const signInUrl = "/sign-in";
		const redirectTo = buildRedirectTo(new URL(request.url));
		const searchParams = new URLSearchParams({ redirectTo });

		throw redirect(`${signInUrl}?${searchParams.toString()}`, {
			headers: { "Set-Cookie": await destroySession(await getSession(request)) },
		});
	}

	return user;
}

function buildRedirectTo(url: URL) {
	let redirectTo = url.pathname;
	const searchParams = url.searchParams.toString();
	if (searchParams.length > 0) {
		redirectTo += `?${searchParams}`;
	}

	return encodeURIComponent(redirectTo);
}

export async function refreshSessionData(request: Request) {
	const {
		user: { id },
	} = await requireLoggedIn(request);
	const user = await db.user.findUnique({ where: { id } });
	if (!user || !user.hashedPassword) {
		logger.warn(`User with id=${id} not found`);
		throw new AuthenticationError("Could not refresh session, user does not exist");
	}

	const sessionData = await buildSessionData(id);
	const session = await getSession(request);
	session.set(authenticator.sessionKey, sessionData);

	return { session, sessionData: sessionData };
}

async function buildSessionData(id: string): Promise<SessionData> {
	const user = await db.user.findUnique({
		where: { id },
		include: {
			memberships: {
				select: {
					organization: {
						select: {
							id: true,
							twilioAccount: {
								select: { accountSid: true, authToken: true },
							},
						},
					},
					role: true,
					id: true,
				},
			},
		},
	});
	if (!user) {
		logger.warn(`User with id=${id} not found`);
		throw new NotFoundError(`User with id=${id} not found`);
	}

	const { hashedPassword, memberships, ...rest } = user;
	const organizations = memberships.map((membership) => ({
		...membership.organization,
		role: membership.role,
		membershipId: membership.id,
	}));
	const { twilioAccount, ...organization } = organizations[0];
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { organizationId_isCurrent: { organizationId: organization.id, isCurrent: true } },
	});
	return {
		user: rest,
		organization,
		phoneNumber,
		twilio: twilioAccount,
	};
}
