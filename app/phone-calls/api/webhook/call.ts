import type { BlitzApiRequest, BlitzApiResponse } from "blitz";
import twilio from "twilio";

import type { ApiError } from "app/core/types";
import db, { Direction, SubscriptionStatus } from "db";
import appLogger from "integrations/logger";
import { translateCallStatus, voiceUrl } from "integrations/twilio";
import updateCallDurationQueue from "../queue/update-call-duration";

const logger = appLogger.child({ route: "/api/webhook/call" });

export default async function incomingCallHandler(req: BlitzApiRequest, res: BlitzApiResponse) {
	console.log("req.body", req.body);

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
			include: {
				organization: {
					include: {
						subscriptions: {
							where: { status: SubscriptionStatus.active },
						},
					},
				},
			},
		});
		if (phoneNumber?.organization.subscriptions.length === 0) {
			// decline the outgoing call because
			// the organization is on the free plan
			res.status(402).end();
		}

		if (
			!phoneNumber ||
			!phoneNumber.organization.twilioAuthToken ||
			!twilio.validateRequest(phoneNumber.organization.twilioAuthToken, twilioSignature, voiceUrl, req.body)
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
				status: translateCallStatus(req.body.CallStatus),
				direction: Direction.Outbound,
				duration: "0",
				organizationId: phoneNumber.organization.id,
				phoneNumberId: phoneNumber.id,
			},
		});
		await updateCallDurationQueue.enqueue(
			{
				organizationId: phoneNumber.organization.id,
				callId: req.body.CallSid,
			},
			{ delay: "30s" },
		);

		const voiceResponse = new twilio.twiml.VoiceResponse();
		const dial = voiceResponse.dial({
			answerOnBridge: true,
			callerId: phoneNumber!.number,
		});
		dial.number(recipient);
		console.log("twiml voiceResponse", voiceResponse.toString());

		res.setHeader("content-type", "text/xml");
		return res.status(200).send(voiceResponse.toString());
	} else {
		const phoneNumbers = await db.phoneNumber.findMany({
			where: { number: req.body.To },
			include: {
				organization: {
					include: {
						subscriptions: {
							where: { status: SubscriptionStatus.active },
						},
					},
				},
			},
		});
		if (phoneNumbers.length === 0) {
			// phone number is not registered by any organization
			res.status(500).end();
			return;
		}

		const phoneNumbersWithActiveSub = phoneNumbers.filter(
			(phoneNumber) => phoneNumber.organization.subscriptions.length > 0,
		);
		if (phoneNumbersWithActiveSub.length === 0) {
			// accept the webhook but reject incoming call
			// because the organization is on the free plan
			const voiceResponse = new twilio.twiml.VoiceResponse();
			voiceResponse.reject();

			console.log("twiml voiceResponse", voiceResponse);
			res.setHeader("content-type", "text/xml");
			res.status(200).send(voiceResponse.toString());
		}
		const phoneNumber = phoneNumbersWithActiveSub.find((phoneNumber) => {
			// if multiple organizations have the same number
			// find the organization currently using that phone number
			// maybe we shouldn't let that happen by restricting a phone number to one org?
			const authToken = phoneNumber.organization.twilioAuthToken ?? "";
			return twilio.validateRequest(authToken, twilioSignature, voiceUrl, req.body);
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

		// TODO dial.client("unique id of device user is picking up with");
		// TODO send notification
		// TODO db.phoneCall.create(...);
		// TODO subscribe to status updates to update duration when call ends
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

const incomingBody = {
	AccountSid: "ACa886d066be0832990d1cf43fb1d53362",
	ApiVersion: "2010-04-01",
	ApplicationSid: "APa43d85150ad6f6cf9869fbe1c1e36a66",
	CallSid: "CA09a5d9a4cfacf2b56d66f8f743d2881a",
	CallStatus: "ringing",
	Called: "+33757592025",
	CalledCity: "",
	CalledCountry: "FR",
	CalledState: "",
	CalledZip: "",
	Caller: "+33613370787",
	CallerCity: "",
	CallerCountry: "FR",
	CallerState: "",
	CallerZip: "",
	Direction: "inbound",
	From: "+33613370787",
	FromCity: "",
	FromCountry: "FR",
	FromState: "",
	FromZip: "",
	To: "+33757592025",
	ToCity: "",
	ToCountry: "FR",
	ToState: "",
	ToZip: "",
};
