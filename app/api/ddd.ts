import { BlitzApiRequest, BlitzApiResponse } from "blitz";

import db from "db";
import twilio from "twilio";

export default async function ddd(req: BlitzApiRequest, res: BlitzApiResponse) {
	await Promise.all([
		db.message.deleteMany(),
		db.phoneCall.deleteMany(),
		db.phoneNumber.deleteMany(),
		db.customer.deleteMany(),
	]);

	await db.user.deleteMany();
	const accountSid = "ACa886d066be0832990d1cf43fb1d53362";
	const authToken = "8696a59a64b94bb4eba3548ed815953b";
	/*const ddd = await twilio(accountSid, authToken)
		.lookups
		.v1
		// .phoneNumbers("+33613370787")
		.phoneNumbers("+33476982071")
		.fetch();*/
	/*try {
		await twilio(accountSid, authToken).messages.create({
			body: "content",
			to: "+213744123789",
			from: "+33757592025",
		});
	} catch (error) {
		console.log(error.code);
		console.log(error.moreInfo);
		console.log(error.details);
		// console.log(JSON.stringify(Object.keys(error)));
	}*/
	/*const ddd = await twilio(accountSid, authToken).messages.create({
		body: "content",
		to: "+33757592025",
		from: "+33757592722",
	});*/

	res.status(200).end();
}
