import { type LoaderFunction, redirect } from "@remix-run/node";
import { refreshSessionData, requireLoggedIn } from "~/utils/auth.server";
import db from "~/utils/db.server";
import { commitSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
	const user = await requireLoggedIn(request);
	const url = new URL(request.url);
	const twilioAccountSid = url.searchParams.get("AccountSid");
	if (!twilioAccountSid) {
		throw new Error("unreachable");
	}

	await db.organization.update({
		where: { id: user.organizations[0].id },
		data: { twilioAccountSid },
	});

	const { session } = await refreshSessionData(request);
	return redirect("/settings/phone", {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
};
