import type { NextApiRequest, NextApiResponse } from "next";
import { insertMessage } from "../../database/message";
import { encrypt } from "../../database/_encryption";
import twilio from "twilio";
import fetchCallsQueue from "./queue/fetch-calls";

export default async function ddd(req: NextApiRequest, res: NextApiResponse) {
	const accountSid = "ACa886d066be0832990d1cf43fb1d53362";
	const authToken = "8696a59a64b94bb4eba3548ed815953b";
	// const ddd = await twilio(accountSid, authToken).incomingPhoneNumbers.list();
	const phoneNumber = "+33757592025";
	/*const ddd = await twilio(accountSid, authToken)
		.messages
		.list({
			to: phoneNumber,
		});*/

	/*const ddd = await insertSms({
		to: "+213",
		type: SmsType.SENT,
		content: encrypt("slt", "4d6d431c9fd1ab7ec620655a793b527bdc4179f0df7fa05dc449d77d90669992"),
		sentAt: new Date().toISOString(),
		from: "+33757592025",
		customerId: "bcb723bc-9706-4811-a964-cc03018bd2ac",
	});*/

	/*const ddd = await twilio(accountSid, authToken)
		.applications
		.create({
			friendlyName: "Test",
			smsUrl: "https://phone.mokhtar.dev/api/webhook/incoming-sms",
			smsMethod: "POST",
			voiceUrl: "https://phone.mokhtar.dev/api/webhook/incoming-call",
			voiceMethod: "POST",
		});*/
	/*const appSid = "AP0f2fa971567ede86e90faaffb2fa5dc0";
	const phoneNumberSid = "PNb77c9690c394368bdbaf20ea6fe5e9fc";
	const ddd = await twilio(accountSid, authToken)
		.incomingPhoneNumbers
		.get(phoneNumberSid)
		.update({
			smsApplicationSid: appSid,
			voiceApplicationSid: appSid,
		});*/

	const customerId = "bcb723bc-9706-4811-a964-cc03018bd2ac";
	const ddd = fetchCallsQueue.enqueue({ customerId }, { id: `fetch-messages-${customerId}` })

	console.log("ddd", ddd);

	return res.status(200).send(ddd);
}

// @ts-ignore
function uuid(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b}
