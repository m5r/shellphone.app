import { type LoaderFunction, json } from "@remix-run/node";

import { getErrorMessage, requireLoggedOut } from "~/utils/auth.server";
import { commitSession, getSession } from "~/utils/session.server";

export type RegisterLoaderData = { errors: { general: string } } | null;

const loader: LoaderFunction = async ({ request }) => {
	const session = await getSession(request);
	const errorMessage = getErrorMessage(session);
	if (errorMessage) {
		return json<RegisterLoaderData>(
			{ errors: { general: errorMessage } },
			{
				headers: { "Set-Cookie": await commitSession(session) },
			},
		);
	}

	await requireLoggedOut(request);

	return null;
};

export default loader;
