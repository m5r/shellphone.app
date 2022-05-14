import { type LoaderFunction, redirect } from "@remix-run/node";
import { refreshSessionData, requireLoggedIn } from "~/utils/auth.server";
import db from "~/utils/db.server";
import { commitSession } from "~/utils/session.server";
import twilio from "twilio";
import serverConfig from "~/config/config.server";

export const loader: LoaderFunction = async ({ request }) => {
	const user = await requireLoggedIn(request);
	const url = new URL(request.url);
	const twilioSubAccountSid = url.searchParams.get("AccountSid");
	if (!twilioSubAccountSid) {
		throw new Error("unreachable");
	}

	const twilioClient = twilio(twilioSubAccountSid, serverConfig.twilio.authToken);
	const twilioSubAccount = await twilioClient.api.accounts(twilioSubAccountSid).fetch();
	const twilioAccountSid = twilioSubAccount.ownerAccountSid;
	await db.organization.update({
		where: { id: user.organizations[0].id },
		data: { twilioSubAccountSid, twilioAccountSid },
	});

	const { session } = await refreshSessionData(request);
	return redirect("/settings/phone", {
		headers: {
			"Set-Cookie": await commitSession(session),
		},
	});
};
