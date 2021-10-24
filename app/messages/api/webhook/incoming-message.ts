import type { BlitzApiRequest, BlitzApiResponse } from "blitz";
import twilio from "twilio";

import appLogger from "../../../../integrations/logger";
import db, { Prisma, SubscriptionStatus } from "../../../../db";
import insertIncomingMessageQueue from "../queue/insert-incoming-message";
import { smsUrl } from "../../../../integrations/twilio";
import type { ApiError } from "../../../core/types";

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

	const body: Body = req.body;
	try {
		const phoneNumbers = await db.phoneNumber.findMany({
			where: { number: body.To },
			include: {
				organization: {
					include: {
						subscriptions: {
							where: {
								OR: [
									{ status: { not: SubscriptionStatus.deleted } },
									{
										status: SubscriptionStatus.deleted,
										cancellationEffectiveDate: { gt: new Date() },
									},
								],
							},
							orderBy: { lastEventTime: Prisma.SortOrder.desc },
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
			// accept the webhook but don't store incoming message
			// because the organization is on the free plan
			res.setHeader("content-type", "text/html");
			res.status(200).send("<Response></Response>");
			return;
		}

		const phoneNumber = phoneNumbersWithActiveSub.find((phoneNumber) => {
			// if multiple organizations have the same number
			// find the organization currently using that phone number
			// maybe we shouldn't let that happen by restricting a phone number to one org?
			const authToken = phoneNumber.organization.twilioAuthToken ?? "";
			return twilio.validateRequest(authToken, twilioSignature, smsUrl, req.body);
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
