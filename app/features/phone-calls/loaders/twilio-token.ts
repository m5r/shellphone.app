import { type LoaderFunction } from "@remix-run/node";
import Twilio from "twilio";

import { decrypt, encrypt } from "~/utils/encryption";
import db from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import getTwilioClient from "~/utils/twilio.server";
import logger from "~/utils/logger.server";

export type TwilioTokenLoaderData = string;

const loader: LoaderFunction = async ({ request }) => {
	const session = await getSession(request);
	const twilio = session.get("twilio");
	if (!twilio) {
		logger.warn("Twilio account is not connected");
		return null;
	}

	const twilioAccount = await db.twilioAccount.findUnique({ where: { accountSid: twilio.accountSid } });
	if (!twilioAccount || !twilioAccount.twimlAppSid) {
		logger.warn(
			"Twilio account is connected but the background jobs didn't run properly, this shouldn't be happening",
		);
		return null;
	}

	const twilioClient = getTwilioClient(twilioAccount);
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
		const apiKey = await twilioClient.newKeys.create({ friendlyName: "Shellphone" });
		apiKeySid = apiKey.sid;
		apiKeySecret = encrypt(apiKey.secret);
		await db.twilioAccount.update({
			where: { accountSid: twilioAccount.accountSid },
			data: { apiKeySid, apiKeySecret },
		});
	}

	const accessToken = new Twilio.jwt.AccessToken(twilioAccount.accountSid, apiKeySid, decrypt(apiKeySecret), {
		identity: `shellphone__${twilio.accountSid}`,
		ttl: 3600,
	});
	const grant = new Twilio.jwt.AccessToken.VoiceGrant({
		outgoingApplicationSid: twilioAccount.twimlAppSid,
		incomingAllow: true,
	});
	accessToken.addGrant(grant);

	const headers = new Headers({ "Content-Type": "text/plain" });
	return new Response(accessToken.toJwt(), { headers });
};

export default loader;
