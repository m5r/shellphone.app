import type { BlitzApiRequest, BlitzApiResponse } from "blitz";
import { getConfig } from "blitz";
import twilio from "twilio";

import type { ApiError } from "../../../api/_types";
import appLogger from "../../../../integrations/logger";
import db from "../../../../db";
import insertIncomingMessageQueue from "../queue/insert-incoming-message";
import notifyIncomingMessageQueue from "../queue/notify-incoming-message";

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
		const phoneNumbers = await db.phoneNumber.findMany({
			where: { number: body.To },
			include: { organization: true },
		});
		if (phoneNumbers.length === 0) {
			// phone number is not registered by any organization
			res.status(500).end();
			return;
		}

		const url = `https://${serverRuntimeConfig.app.baseUrl}/api/webhook/incoming-message`;
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

		const messageSid = body.MessageSid;
		const organizationId = phoneNumber.organization.id;
		const phoneNumberId = phoneNumber.id;
		await insertIncomingMessageQueue.enqueue(
			{
				messageSid,
				organizationId,
				phoneNumberId,
			},
			{ id: `insert-${messageSid}-${organizationId}-${phoneNumberId}` },
		);

		res.setHeader("content-type", "text/html");
		res.status(200).send("<Response></Response>");
	} catch (error: any) {
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
