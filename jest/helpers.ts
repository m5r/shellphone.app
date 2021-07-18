import type { NextApiHandler } from "next";
import type { IncomingMessage, RequestListener, ServerResponse } from "http";
import http from "http";
import type { __ApiPreviewProps } from "next/dist/next-server/server/api-utils";
import { apiResolver } from "next/dist/next-server/server/api-utils";
import listen from "test-listen";
import fetch from "isomorphic-fetch";
import crypto from "crypto";

type Authentication =
	| "none"
	| "auth0"
	| "google-oauth2"
	| "facebook"
	| "twitter";

type Params = {
	method: string;
	body?: any;
	headers?: Record<string, string>;
	query?: Record<string, string>;
	authentication?: Authentication;
};

const apiPreviewProps: __ApiPreviewProps = {
	previewModeEncryptionKey: crypto.randomBytes(16).toString("hex"),
	previewModeId: crypto.randomBytes(32).toString("hex"),
	previewModeSigningKey: crypto.randomBytes(32).toString("hex"),
};

export async function callApiHandler(handler: NextApiHandler, params: Params) {
	const {
		method = "GET",
		body,
		headers = {},
		query = {},
		authentication = "none",
	} = params;

	const requestHandler: RequestListener = (req, res) => {
		const propagateError = false;
		Object.assign(req.headers, headers);

		if (req.url !== "/") {
			// in these API tests, our http server uses the same handler for all routes, it has no idea about our app's routes
			// when we're hitting anything else than the / route, it means that we've been redirected
			const fallbackHandler: NextApiHandler = (req, res) =>
				res.status(200).end();

			return apiResolver(
				req,
				res,
				query,
				fallbackHandler,
				apiPreviewProps,
				propagateError,
			);
		}

		if (authentication !== "none") {
			writeSessionToCookie(req, res, authentication);
		}

		return apiResolver(
			req,
			res,
			query,
			handler,
			apiPreviewProps,
			propagateError,
		);
	};

	const server = http.createServer(requestHandler);
	const url = await listen(server);
	let fetchOptions: RequestInit = { method, redirect: "manual" };
	if (body) {
		fetchOptions.body = JSON.stringify(body);
		fetchOptions.headers = { "Content-Type": "application/json" };
	}

	const response = await fetch(url, fetchOptions);
	server.close();

	return response;
}

function writeSessionToCookie(
	req: IncomingMessage,
	res: ServerResponse,
	authentication: Authentication,
) {
	const session = {
		id: `${authentication}|userId`,
		email: "test@fss.test",
		name: "Groot",
		teamId: "teamId",
		role: "owner",
	};

	const setCookieHeader = res.getHeader("Set-Cookie") as string[];
	// write it to request headers to immediately have access to the user's session
	req.headers.cookie = setCookieHeader.join("");
}
