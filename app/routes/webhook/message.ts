import { type ActionFunction } from "@remix-run/node";
import { badRequest, html, notFound, serverError } from "remix-utils";
import twilio from "twilio";
import { z } from "zod";
import { Prisma, SubscriptionStatus } from "@prisma/client";

import insertIncomingMessageQueue from "~/queues/insert-incoming-message.server";
import notifyIncomingMessageQueue from "~/queues/notify-incoming-message.server";
import logger from "~/utils/logger.server";
import db from "~/utils/db.server";
import { smsUrl } from "~/utils/twilio.server";
import { decrypt } from "~/utils/encryption";
import { validate } from "~/utils/validation.server";

export const action: ActionFunction = async ({ request }) => {
	const twilioSignature = request.headers.get("X-Twilio-Signature") || request.headers.get("x-twilio-signature");
	if (!twilioSignature || Array.isArray(twilioSignature)) {
		return badRequest("Invalid header X-Twilio-Signature");
	}

	const formData = Object.fromEntries(await request.formData());
	const validation = validate(bodySchema, formData);
	if (validation.errors) {
		logger.error(validation.errors);
		return badRequest("");
	}

	const body = validation.data;
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

		/*const phoneNumbersWithActiveSub = phoneNumbers.filter(
			(phoneNumber) => phoneNumber.twilioAccount.organization.subscriptions.length > 0,
		);
		if (phoneNumbersWithActiveSub.length === 0) {
			// accept the webhook but don't store incoming message
			// because the organization is on the free plan
			console.log("no active subscription"); // TODO: uncomment the line below -- beware: refresh phone numbers refetch those missed messages lol
			// return html("<Response></Response>");
		}*/

		const phoneNumber = phoneNumbers.find((phoneNumber) => {
			// TODO: uncomment the line below
			// const phoneNumber = phoneNumbersWithActiveSub.find((phoneNumber) => {
			// if multiple organizations have the same number
			// find the organization currently using that phone number
			// maybe we shouldn't let that happen by restricting a phone number to one org?
			const encryptedAuthToken = phoneNumber.twilioAccount.authToken;
			const authToken = encryptedAuthToken ? decrypt(encryptedAuthToken) : "";
			return twilio.validateRequest(authToken, twilioSignature, smsUrl, formData);
		});
		if (!phoneNumber) {
			return badRequest("Invalid webhook");
		}

		const messageSid = body.MessageSid;
		const phoneNumberId = phoneNumber.id;
		await Promise.all([
			insertIncomingMessageQueue.add(`insert message ${messageSid} for ${phoneNumberId}`, {
				messageSid,
				phoneNumberId,
			}),
			notifyIncomingMessageQueue.add(`notify incoming message ${messageSid} for ${phoneNumberId}`, {
				messageSid,
				phoneNumberId,
			}),
		]);

		return html("<Response></Response>");
	} catch (error: any) {
		logger.error(error);

		return serverError(error.message);
	}
};

const bodySchema = z.object({
	MessageSid: z.string(),
	To: z.string(),
	ToCountry: z.string().optional(),
	ToState: z.string().optional(),
	SmsMessageSid: z.string().optional(),
	NumMedia: z.string().optional(),
	ToCity: z.string().optional(),
	FromZip: z.string().optional(),
	SmsSid: z.string().optional(),
	FromState: z.string().optional(),
	SmsStatus: z.string().optional(),
	FromCity: z.string().optional(),
	Body: z.string().optional(),
	FromCountry: z.string().optional(),
	ToZip: z.string().optional(),
	NumSegments: z.string().optional(),
	AccountSid: z.string().optional(),
	From: z.string().optional(),
	ApiVersion: z.string().optional(),
	ReferralNumMedia: z.string().optional(),
});
