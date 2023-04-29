import type { Request, Response } from "express";
import type { ActionFunction, DataFunctionArgs, LoaderFunction, ServerBuild } from "@remix-run/node";
import { isResponse } from "@remix-run/server-runtime/dist/responses";
import type { Transaction } from "@sentry/types";
import * as Sentry from "@sentry/node";
import { v4 as uuid } from "uuid";

import { __getSession } from "~/utils/session.server";
import type { SessionData } from "~/utils/auth.server";

function wrapDataFunc(func: ActionFunction | LoaderFunction, routeId: string, method: string) {
	const ogFunc = func;

	return async (args: DataFunctionArgs) => {
		const session = await __getSession(args.request.headers.get("Cookie"));
		const sessionData: SessionData | undefined = session.data.user;
		if (sessionData) {
			Sentry.setUser({
				id: sessionData.user.id,
				email: sessionData.user.email,
				role: sessionData.user.role,
			});
		} else {
			Sentry.configureScope((scope) => scope.setUser(null));
		}

		const parentTransaction: Transaction | undefined = args.context && (args.context.__sentry_transaction as any);
		const transaction = parentTransaction?.startChild({
			op: `${method}:${routeId}`,
			description: `${method}: ${routeId}`,
		});
		if (transaction) {
			transaction.setStatus("ok");
			transaction.transaction = parentTransaction;
		}

		try {
			return await ogFunc(args);
		} catch (error) {
			if (isResponse(error)) {
				throw error;
			}

			Sentry.captureException(error, {
				tags: {
					global_id: parentTransaction && parentTransaction.tags["global_id"],
				},
			});
			transaction?.setStatus("internal_error");
			throw error;
		} finally {
			transaction?.finish();
		}
	};
}

// Register Sentry across your entire remix build.
export function registerSentry(build: ServerBuild) {
	type Route = ServerBuild["routes"][string];

	const routes: Record<string, Route> = {};

	for (const [id, route] of Object.entries(build.routes)) {
		const newRoute: Route = { ...route, module: { ...route.module } };

		if (route.module.action) {
			newRoute.module.action = wrapDataFunc(route.module.action, id, "action");
		}

		if (route.module.loader) {
			newRoute.module.loader = wrapDataFunc(route.module.loader, id, "loader");
		}

		routes[id] = newRoute;
	}

	return {
		...build,
		routes,
	};
}

export function sentryLoadContext(req: Request, res: Response) {
	const transaction = Sentry.getCurrentHub().startTransaction({
		op: "request",
		name: `${req.method}: ${req.url}`,
		description: `${req.method}: ${req.url}`,
		metadata: {
			requestPath: req.url,
		},
		tags: {
			global_id: uuid(),
		},
	});
	transaction && transaction.setStatus("internal_error");

	res.once("finish", () => {
		if (transaction) {
			transaction.setHttpStatus(res.statusCode);
			transaction.setTag("http.status_code", res.statusCode);
			transaction.setTag("http.method", req.method);
			transaction.finish();
		}
	});

	return {
		__sentry_transaction: transaction,
	};
}
