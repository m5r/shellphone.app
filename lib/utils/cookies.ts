import type { IncomingMessage, ServerResponse } from "http";
import type { CookieSerializeOptions } from "cookie";
import nookies from "nookies";

const defaultOptions: CookieSerializeOptions = {
	httpOnly: true,
	sameSite: "lax",
	path: "/",
};

export function getCookies(req?: BaseParams["req"]) {
	const context = buildContext({ req });

	return nookies.get(context);
}

type SetCookieParams = BaseParams & {
	value: string;
	options?: CookieSerializeOptions;
};

export function setCookie(params: SetCookieParams) {
	const { req, res, name, value } = params;
	const context = buildContext({ res });
	const options: CookieSerializeOptions = {
		...defaultOptions,
		...params.options,
		secure: isSecureEnvironment(req),
	};

	return nookies.set(context, name, value, options);
}

type DestroyCookieParams = BaseParams & {
	options?: CookieSerializeOptions;
};

export function destroyCookie(params: DestroyCookieParams) {
	const { res, name } = params;
	const context = buildContext({ res });
	const options = Object.assign({}, defaultOptions, params.options);

	return nookies.destroy(context, name, options);
}

function isSecureEnvironment(req: IncomingMessage | null | undefined): boolean {
	if (process.env.NODE_ENV !== "production") {
		return false;
	}

	if (!req || !req.headers || !req.headers.host) {
		return false;
	}

	const host =
		(req.headers.host.indexOf(":") > -1 &&
			req.headers.host.split(":")[0]) ||
		req.headers.host;

	return !["localhost", "127.0.0.1"].includes(host);
}

type BaseParams = {
	req?: IncomingMessage | null;
	res?: ServerResponse | null;
	name: string;
};

function buildContext({ req, res }: Pick<BaseParams, "req" | "res">) {
	if (req !== null && typeof req !== "undefined") {
		return { req };
	}

	if (res !== null && typeof res !== "undefined") {
		return { res };
	}

	return null;
}
