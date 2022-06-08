import { Queue } from "~/utils/queue.server";
import db from "~/utils/db.server";
import getTwilioClient from "~/utils/twilio.server";
import { encrypt } from "~/utils/encryption";

type Payload = {
	accountSid: string;
};

export default Queue<Payload>("set twilio api key", async ({ data }) => {
	const accountSid = data.accountSid;
	const twilioAccount = await db.twilioAccount.findUnique({ where: { accountSid } });
	if (!twilioAccount) {
		return;
	}

	const twilioClient = getTwilioClient(twilioAccount);
	const friendlyName = "Shellphone API key";

	await new Promise((resolve) => {
		twilioClient.api.keys.each({ done: resolve }, (apiKey) => {
			if (apiKey.friendlyName === friendlyName) {
				apiKey.remove();
			}
		});
	});

	const apiKey = await twilioClient.newKeys.create({ friendlyName });
	await db.twilioAccount.update({
		where: { accountSid },
		data: {
			apiKeySid: apiKey.sid,
			apiKeySecret: encrypt(apiKey.secret),
		},
	});
});
