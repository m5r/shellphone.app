import { useMatches } from "@remix-run/react";

import type { SessionOrganization, SessionUser } from "~/utils/auth.server";

export default function useSession() {
	const matches = useMatches();
	const __appRoute = matches.find((match) => match.id === "routes/__app");
	if (!__appRoute) {
		throw new Error("useSession hook called outside _app route");
	}

	return __appRoute.data as SessionUser & { currentOrganization: SessionOrganization };
}
