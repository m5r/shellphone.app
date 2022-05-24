import { type LoaderFunction } from "@remix-run/node";
import Twilio from "twilio";

import { refreshSessionData, requireLoggedIn } from "~/utils/auth.server";
import { encrypt } from "~/utils/encryption";
import db from "~/utils/db.server";
import { commitSession } from "~/utils/session.server";
import getTwilioClient from "~/utils/twilio.server";

export type TwilioTokenLoaderData = string;

const loader: LoaderFunction = async ({ request }) => {
	const { user, organization, twilioAccount } = await requireLoggedIn(request);
	if (!twilioAccount || !twilioAccount.twimlAppSid) {
		throw new Error("unreachable");
	}

	const twilioClient = getTwilioClient(twilioAccount);
	let shouldRefreshSession = false;
	let { apiKeySid, apiKeySecret } = twilioAccount;
	if (apiKeySid && apiKeySecret) {
		try {
			await twilioClient.keys.get(apiKeySid).fetch();
		} catch (error: any) {
			if (error.code !== 20404) {
				throw error;
			}

			apiKeySid = null;
			apiKeySecret = null;
		}
	}
	if (!apiKeySid || !apiKeySecret) {
		shouldRefreshSession = true;
		const apiKey = await twilioClient.newKeys.create({ friendlyName: "Shellphone" });
		apiKeySid = apiKey.sid;
		apiKeySecret = apiKey.secret;
		await db.twilioAccount.update({
			where: { subAccountSid: twilioAccount.subAccountSid },
			data: { apiKeySid: apiKey.sid, apiKeySecret: encrypt(apiKey.secret) },
		});
	}

	const accessToken = new Twilio.jwt.AccessToken(twilioAccount.subAccountSid, apiKeySid, apiKeySecret, {
		identity: `${organization.id}__${user.id}`,
		ttl: 3600,
	});
	const grant = new Twilio.jwt.AccessToken.VoiceGrant({
		outgoingApplicationSid: twilioAccount.twimlAppSid,
		incomingAllow: true,
	});
	accessToken.addGrant(grant);

	const headers = new Headers({ "Content-Type": "text/plain" });
	if (shouldRefreshSession) {
		const { session } = await refreshSessionData(request);
		headers.set("Set-Cookie", await commitSession(session));
	}

	return new Response(accessToken.toJwt(), { headers });
};

export default loader;
