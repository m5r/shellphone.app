import type { LoaderFunction } from "@remix-run/node";

import authenticator from "~/utils/authenticator.server";

export const loader: LoaderFunction = async ({ request }) => {
	const searchParams = new URL(request.url).searchParams;
	const redirectTo = searchParams.get("redirectTo") ?? "/";
	await authenticator.logout(request, { redirectTo });
};
