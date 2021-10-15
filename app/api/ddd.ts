import { BlitzApiRequest, BlitzApiResponse } from "blitz";

import db from "db";
import twilio from "twilio";
import setTwilioWebhooks from "../settings/api/queue/set-twilio-webhooks";
import backup from "../../db/backup";
import { sendEmail } from "../../integrations/aws-ses";

export default async function ddd(req: BlitzApiRequest, res: BlitzApiResponse) {
	/*await Promise.all([
		db.message.deleteMany(),
		db.phoneCall.deleteMany(),
		db.phoneNumber.deleteMany(),
	]);
	await db.customer.deleteMany();
	await db.user.deleteMany();*/

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
		body: "cccccasdasd",
		to: "+33757592025",
		from: "+33757592722",
	});*/
	/*const [messagesSent, messagesReceived] = await Promise.all([
		twilio(accountSid, authToken).messages.list({
			from: "+33757592025",
		}),
		twilio(accountSid, authToken).messages.list({
			to: "+33757592025",
		}),
	]);

	console.log("messagesReceived", messagesReceived.sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime()));
	// console.log("messagesReceived", messagesReceived);*/

	/*setTwilioWebhooks.enqueue({
		phoneNumberId: "PNb77c9690c394368bdbaf20ea6fe5e9fc",
		organizationId: "95267d60-3d35-4c36-9905-8543ecb4f174",
	});*/
	/*try {
		const before = Date.now();
		await backup("daily");
		console.log(`took ${Date.now() - before}ms`);
	} catch (error) {
		console.error("dddd error", error);
		res.status(500).end();
	}*/

	// setTimeout(() => {
	res.status(200).end();
	// }, 1000 * 60 * 5);
}
