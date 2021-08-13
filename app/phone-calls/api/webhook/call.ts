import type { BlitzApiRequest, BlitzApiResponse } from "blitz";
import Twilio from "twilio";

import db from "../../../../db";

export default async function incomingCallHandler(req: BlitzApiRequest, res: BlitzApiResponse) {
	console.log("req.body", req.body);

	const isOutgoingCall = true;
	if (isOutgoingCall) {
		const recipient = req.body.To;
		const organizationId = req.body.From.slice("client:".length).split("__")[0];
		const phoneNumber = await db.phoneNumber.findFirst({
			where: { organizationId },
			select: { number: true },
		});
		const twiml = new Twilio.twiml.VoiceResponse();
		const dial = twiml.dial({
			answerOnBridge: true,
			callerId: phoneNumber!.number,
		});
		dial.number(recipient);
		console.log("twiml", twiml.toString());

		res.setHeader("content-type", "text/xml");
		return res.status(200).send(twiml.toString());
	}

	res.status(500).end();
}

const outgoingBody = {
	AccountSid: "ACa886d066be0832990d1cf43fb1d53362",
	ApiVersion: "2010-04-01",
	ApplicationSid: "AP6334c6dd54f5808717b37822de4e4e14",
	CallSid: "CA3b639875693fd8f563e07937780c9f5f",
	CallStatus: "ringing",
	Called: "",
	Caller: "client:95267d60-3d35-4c36-9905-8543ecb4f174__673b461a-11ba-43a4-89d7-9e29403053d4",
	Direction: "inbound",
	From: "client:95267d60-3d35-4c36-9905-8543ecb4f174__673b461a-11ba-43a4-89d7-9e29403053d4",
	To: "+33613370787",
};
