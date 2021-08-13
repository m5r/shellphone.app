import type { BlitzApiRequest, BlitzApiResponse } from "blitz";
import { getConfig } from "blitz";
import twilio from "twilio";

import type { ApiError } from "../../../_types";
import db, { Direction } from "../../../../db";
import appLogger from "../../../../integrations/logger";

const { serverRuntimeConfig } = getConfig();
const logger = appLogger.child({ route: "/api/webhook/call" });

export default async function incomingCallHandler(req: BlitzApiRequest, res: BlitzApiResponse) {
	console.log("req.body", req.body);

	const url = `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/incoming-message`;
	const twilioSignature = req.headers["X-Twilio-Signature"] || req.headers["x-twilio-signature"];
	if (!twilioSignature || Array.isArray(twilioSignature)) {
		const statusCode = 400;
		const apiError: ApiError = {
			statusCode,
			errorMessage: "Invalid header X-Twilio-Signature",
		};
		logger.error(apiError);

		res.status(statusCode).send(apiError);
		return;
	}

	const isOutgoingCall = req.body.From.startsWith("client:");
	if (isOutgoingCall) {
		const recipient = req.body.To;
		const organizationId = req.body.From.slice("client:".length).split("__")[0];
		const phoneNumber = await db.phoneNumber.findFirst({
			where: { organizationId },
			include: { organization: true },
		});
		if (
			!phoneNumber ||
			!phoneNumber.organization.twilioAuthToken ||
			!twilio.validateRequest(phoneNumber.organization.twilioAuthToken, twilioSignature, url, req.body)
		) {
			const statusCode = 400;
			const apiError: ApiError = {
				statusCode,
				errorMessage: "Invalid webhook",
			};
			logger.error(apiError);

			res.status(statusCode).send(apiError);
			return;
		}

		await db.phoneCall.create({
			data: {
				id: req.body.CallSid,
				from: phoneNumber.number,
				to: req.body.To,
				status: req.body.CallStatus,
				direction: Direction.Outbound,
				duration: "", // TODO
				organizationId: phoneNumber.organization.id,
				phoneNumberId: phoneNumber.id,
			},
		});
		const twiml = new twilio.twiml.VoiceResponse();
		const dial = twiml.dial({
			answerOnBridge: true,
			callerId: phoneNumber!.number,
		});
		dial.number(recipient);
		console.log("twiml", twiml.toString());

		res.setHeader("content-type", "text/xml");
		return res.status(200).send(twiml.toString());
	} else {
		const phoneNumbers = await db.phoneNumber.findMany({
			where: { number: req.body.To },
			include: { organization: true },
		});
		if (phoneNumbers.length === 0) {
			// phone number is not registered by any organization
			res.status(500).end();
			return;
		}

		const phoneNumber = phoneNumbers.find((phoneNumber) => {
			// if multiple organizations have the same number
			// find the organization currently using that phone number
			// maybe we shouldn't let multiple organizations use the same phone number
			const authToken = phoneNumber.organization.twilioAuthToken ?? "";
			return twilio.validateRequest(authToken, twilioSignature, url, req.body);
		});
		if (!phoneNumber) {
			const statusCode = 400;
			const apiError: ApiError = {
				statusCode,
				errorMessage: "Invalid webhook",
			};
			logger.error(apiError);

			res.status(statusCode).send(apiError);
			return;
		}

		// TODO send notification
		// TODO db.phoneCall.create(...);
	}

	// TODO queue job to update duration when call ends

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
