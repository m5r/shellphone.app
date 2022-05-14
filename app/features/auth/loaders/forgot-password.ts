import type { LoaderFunction } from "@remix-run/node";

import { requireLoggedOut } from "~/utils/auth.server";

const loader: LoaderFunction = async ({ request }) => {
	await requireLoggedOut(request);

	return null;
};

export default loader;
