import type { BlitzApiRequest, BlitzApiResponse } from "blitz";
import { getConfig } from "blitz";
import twilio from "twilio";

import type { ApiError } from "../../../api/_types";
import appLogger from "../../../../integrations/logger";
import db from "../../../../db";
import insertIncomingMessageQueue from "../queue/insert-incoming-message";

const logger = appLogger.child({ route: "/api/webhook/incoming-message" });
const { serverRuntimeConfig } = getConfig();

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

	const body: Body = req.body;
	try {
		const customerPhoneNumber = await db.phoneNumber.findFirst({
			where: { phoneNumber: body.To },
		});
		if (!customerPhoneNumber) {
			// phone number is not registered by any of our customer
			res.status(200).end();
			return;
		}

		const customer = await db.customer.findFirst({
			where: { id: customerPhoneNumber.customerId },
		});
		if (!customer || !customer.authToken) {
			res.status(200).end();
			return;
		}

		const url = `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/incoming-message`;
		const isRequestValid = twilio.validateRequest(
			customer.authToken,
			twilioSignature,
			url,
			req.body,
		);
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

		const messageSid = body.MessageSid;
		await insertIncomingMessageQueue.enqueue(
			{
				messageSid,
				customerId: customer.id,
			},
			{ id: messageSid },
		);

		res.status(200).end();
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
