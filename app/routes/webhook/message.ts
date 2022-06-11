import { type ActionFunction } from "@remix-run/node";
import { badRequest, html, notFound, serverError } from "remix-utils";
import { Prisma, SubscriptionStatus } from "@prisma/client";

import insertIncomingMessageQueue from "~/queues/insert-incoming-message.server";
import logger from "~/utils/logger.server";
import db from "~/utils/db.server";
import twilio from "twilio";
import { smsUrl } from "~/utils/twilio.server";
import { decrypt } from "~/utils/encryption";

export const action: ActionFunction = async ({ request }) => {
	const twilioSignature = request.headers.get("X-Twilio-Signature") || request.headers.get("x-twilio-signature");
	if (!twilioSignature || Array.isArray(twilioSignature)) {
		return badRequest("Invalid header X-Twilio-Signature");
	}

	const body: Body = await request.json();
	try {
		const phoneNumbers = await db.phoneNumber.findMany({
			where: { number: body.To },
			include: {
				twilioAccount: {
					include: {
						organization: {
							select: {
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
				},
			},
		});
		if (phoneNumbers.length === 0) {
			// phone number is not registered by any organization
			return notFound("Phone number not found");
		}

		const phoneNumbersWithActiveSub = phoneNumbers.filter(
			(phoneNumber) => phoneNumber.twilioAccount.organization.subscriptions.length > 0,
		);
		if (phoneNumbersWithActiveSub.length === 0) {
			// accept the webhook but don't store incoming message
			// because the organization is on the free plan
			return html("<Response></Response>");
		}

		const phoneNumber = phoneNumbersWithActiveSub.find((phoneNumber) => {
			// if multiple organizations have the same number
			// find the organization currently using that phone number
			// maybe we shouldn't let that happen by restricting a phone number to one org?
			const encryptedAuthToken = phoneNumber.twilioAccount.authToken;
			const authToken = encryptedAuthToken ? decrypt(encryptedAuthToken) : "";
			return twilio.validateRequest(authToken, twilioSignature, smsUrl, body);
		});
		if (!phoneNumber) {
			return badRequest("Invalid webhook");
		}

		const messageSid = body.MessageSid;
		const phoneNumberId = phoneNumber.id;
		await insertIncomingMessageQueue.add(`insert message ${messageSid} for ${phoneNumberId}`, {
			messageSid,
			phoneNumberId,
		});

		return html("<Response></Response>");
	} catch (error: any) {
		logger.error(error);

		return serverError(error.message);
	}
};

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
