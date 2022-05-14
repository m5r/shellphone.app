import { type LoaderFunction, redirect } from "@remix-run/node";

import { requireLoggedOut } from "~/utils/auth.server";
import { commitSession, getSession } from "~/utils/session.server";

const loader: LoaderFunction = async ({ request }) => {
	const session = await getSession(request);
	const searchParams = new URL(request.url).searchParams;
	const token = searchParams.get("token");
	if (!token) {
		return redirect("/forgot-password");
	}

	await requireLoggedOut(request);

	return new Response(null, {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
};

export default loader;
