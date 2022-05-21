import { type Session, type SessionIdStorageStrategy, createSessionStorage } from "@remix-run/node";

import serverConfig from "~/config/config.server";
import db from "./db.server";
import logger from "./logger.server";
import authenticator from "~/utils/authenticator.server";
import type { SessionData } from "~/utils/auth.server";

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const sessionStorage = createDatabaseSessionStorage({
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

export function getSession(request: Request): Promise<Session> {
	return sessionStorage.getSession(request.headers.get("Cookie"));
}

export const { commitSession, destroySession, getSession: __getSession } = sessionStorage;

function createDatabaseSessionStorage({ cookie }: Pick<SessionIdStorageStrategy, "cookie">) {
	return createSessionStorage({
		cookie,
		async createData(sessionData, expiresAt) {
			let user;
			const sessionAuthData: SessionData = sessionData[authenticator.sessionKey];
			if (sessionAuthData) {
				user = { connect: { id: sessionAuthData.user.id } };
			}
			const { id } = await db.session.create({
				data: {
					expiresAt,
					user,
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
