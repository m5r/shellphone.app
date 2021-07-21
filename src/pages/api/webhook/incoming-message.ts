import type { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

import type { ApiError } from "../_types";
import appLogger from "../../../../lib/logger";
import { findCustomerByPhoneNumber } from "../../../database/customer";
import { insertMessage } from "../../../database/message";
import { encrypt } from "../../../database/_encryption";

const logger = appLogger.child({ route: "/api/webhook/incoming-message" });

export default async function incomingMessageHandler(req: NextApiRequest, res: NextApiResponse) {
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
	try {
		const phoneNumber = req.body.To;
		const customer = await findCustomerByPhoneNumber(phoneNumber);
		const url = "https://phone.mokhtar.dev/api/webhook/incoming-message";
		const isRequestValid = twilio.validateRequest(customer.authToken!, twilioSignature, url, req.body);
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

		await insertMessage({
			customerId: customer.id,
			to: req.body.To,
			from: req.body.From,
			status: "received",
			direction: "inbound",
			sentAt: req.body.DateSent,
			content: encrypt(req.body.Body, customer.encryptionKey),
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