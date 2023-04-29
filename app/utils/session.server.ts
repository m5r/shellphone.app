import { type Session, type SessionIdStorageStrategy, createSessionStorage } from "@remix-run/node";
import type { TwilioAccount } from "@prisma/client";

import serverConfig from "~/config/config.server";
import db from "./db.server";
import logger from "./logger.server";

type SessionTwilioAccount = Pick<TwilioAccount, "accountSid" | "authToken">;
export type SessionData = {
	twilio?: SessionTwilioAccount | null;
};

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const sessionStorage = createDatabaseSessionStorage<SessionData>({
	cookie: {
		name: "__session",
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secrets: [serverConfig.app.sessionSecret],
		secure: process.env.NODE_ENV === "production" && process.env.CI !== "true",
		maxAge: 30 * DAY,
	},
});

export function getSession(request: Request): Promise<Session<SessionData>> {
	return sessionStorage.getSession(request.headers.get("Cookie"));
}

export const { commitSession } = sessionStorage;

function createDatabaseSessionStorage<Data extends SessionData = SessionData>({
	cookie,
}: Pick<SessionIdStorageStrategy, "cookie">) {
	return createSessionStorage<Data>({
		cookie,
		async createData(sessionData, expiresAt) {
			let twilioAccount;
			if (sessionData.twilio) {
				twilioAccount = { connect: { accountSid: sessionData.twilio.accountSid } };
			}
			const { id } = await db.session.create({
				data: {
					expiresAt,
					twilioAccount,
					data: JSON.stringify(sessionData),
				},
			});
			return id;
		},
		async readData(id) {
			const session = await db.session.findUnique({ where: { id } });
			if (!session) {
				return null;
			}

			const sessionHasExpired = session.expiresAt && session.expiresAt < new Date();
			if (sessionHasExpired) {
				await db.session.delete({ where: { id } });
				return null;
			}

			return JSON.parse(session.data);
		},
		async updateData(id, sessionData, expiresAt) {
			try {
				await db.session.update({
					where: { id },
					data: {
						data: JSON.stringify(sessionData),
						expiresAt,
					},
				});
			} catch (error: any) {
				if (error.code === "P2025") {
					logger.warn("Could not update session because it's not in the DB");
					return;
				}

				throw error;
			}
		},
		async deleteData(id) {
			try {
				await db.session.delete({ where: { id } });
			} catch (error: any) {
				if (error.code === "P2025") {
					logger.warn("Could not delete session because it's not in the DB");
					return;
				}

				throw error;
			}
		},
	});
}
