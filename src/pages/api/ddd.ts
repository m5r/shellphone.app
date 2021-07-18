import type { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

export default async function ddd(req: NextApiRequest, res: NextApiResponse) {
	const accountSid = "ACa886d066be0832990d1cf43fb1d53362";
	const authToken = "8696a59a64b94bb4eba3548ed815953b";
	// const ddd = await twilio(accountSid, authToken).incomingPhoneNumbers.list();
	const phoneNumber = "+33757592025";
	const ddd = await twilio(accountSid, authToken)
		.messages
		.list({
			to: phoneNumber,
		});

	console.log("ddd", ddd);

	return res.status(200).send(ddd);
}

// @ts-ignore
function uuid(a,b){for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-');return b}
