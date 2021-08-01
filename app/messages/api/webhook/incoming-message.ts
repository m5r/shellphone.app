import type { BlitzApiRequest, BlitzApiResponse } from "blitz";
import twilio from "twilio";

import type { ApiError } from "../../../api/_types";
import appLogger from "../../../../integrations/logger";
import { encrypt } from "../../../../db/_encryption";
import db, { Direction, MessageStatus } from "../../../../db";
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";

const logger = appLogger.child({ route: "/api/webhook/incoming-message" });

export default async function incomingMessageHandler(req: BlitzApiRequest, res: BlitzApiResponse) {
	if (req.method !== "POST") {
		const statusCode = 405;
		const apiError: ApiError = {
			statusCode,
			errorMessage: `Method ${req.method} Not Allowed`,
		};
		logger.error(apiError);

		res.setHeader("Allow", ["POST"]);
		res.status(statusCode).send(apiError);
		return;
	}

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

	console.log("req.body", req.body);
	// TODO: return 200 and process this in the background
	try {
		const phoneNumber = req.body.To;
		const customerPhoneNumber = await db.phoneNumber.findFirst({
			where: { phoneNumber },
		});
		console.log("customerPhoneNumber", customerPhoneNumber);
		if (!customerPhoneNumber) {
			// phone number is not registered by any customer
			res.status(200).end();
			return;
		}

		const customer = await db.customer.findFirst({
			where: { id: customerPhoneNumber.customerId },
		});
		console.log("customer", customer);
		if (!customer || !customer.authToken) {
			res.status(200).end();
			return;
		}

		const url = "https://4cbc3f38c23a.ngrok.io/api/webhook/incoming-message";
		const isRequestValid = twilio.validateRequest(
			customer.authToken,
			twilioSignature,
			url,
			req.body
		);
		console.log("isRequestValid", isRequestValid);
		if (!isRequestValid) {
			const statusCode = 400;
			const apiError: ApiError = {
				statusCode,
				errorMessage: "Invalid webhook",
			};
			logger.error(apiError);

			res.status(statusCode).send(apiError);
			return;
		}

		// TODO: send notification

		const body: Body = req.body;
		const messageSid = body.MessageSid;
		const message = await twilio(customer.accountSid!, customer.authToken)
			.messages.get(messageSid)
			.fetch();
		await db.message.create({
			data: {
				customerId: customer.id,
				to: message.to,
				from: message.from,
				status: translateStatus(message.status),
				direction: translateDirection(message.direction),
				sentAt: message.dateCreated,
				content: encrypt(message.body, customer.encryptionKey),
			},
		});
	} catch (error) {
		const statusCode = error.statusCode ?? 500;
		const apiError: ApiError = {
			statusCode,
			errorMessage: error.message,
		};
		logger.error(error);

		res.status(statusCode).send(apiError);
	}
}

type Body = {
	ToCountry: string;
	ToState: string;
	SmsMessageSid: string;
	NumMedia: string;
	ToCity: string;
	FromZip: string;
	SmsSid: string;
	FromState: string;
	SmsStatus: string;
	FromCity: string;
	Body: string;
	FromCountry: string;
	To: string;
	ToZip: string;
	NumSegments: string;
	MessageSid: string;
	AccountSid: string;
	From: string;
	ApiVersion: string;
};

function translateDirection(direction: MessageInstance["direction"]): Direction {
	switch (direction) {
		case "inbound":
			return Direction.Inbound;
		case "outbound-api":
		case "outbound-call":
		case "outbound-reply":
		default:
			return Direction.Outbound;
	}
}

function translateStatus(status: MessageInstance["status"]): MessageStatus {
	switch (status) {
		case "accepted":
			return MessageStatus.Accepted;
		case "canceled":
			return MessageStatus.Canceled;
		case "delivered":
			return MessageStatus.Delivered;
		case "failed":
			return MessageStatus.Failed;
		case "partially_delivered":
			return MessageStatus.PartiallyDelivered;
		case "queued":
			return MessageStatus.Queued;
		case "read":
			return MessageStatus.Read;
		case "received":
			return MessageStatus.Received;
		case "receiving":
			return MessageStatus.Receiving;
		case "scheduled":
			return MessageStatus.Scheduled;
		case "sending":
			return MessageStatus.Sending;
		case "sent":
			return MessageStatus.Sent;
		case "undelivered":
			return MessageStatus.Undelivered;
	}
}
