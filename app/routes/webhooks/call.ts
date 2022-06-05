import { type ActionFunction } from "@remix-run/node";
import { type CallInstance } from "twilio/lib/rest/api/v2010/account/call";
import { badRequest, serverError } from "remix-utils";
import { Direction, Prisma, SubscriptionStatus } from "@prisma/client";

import logger from "~/utils/logger.server";
import db from "~/utils/db.server";
import twilio from "twilio";
import { voiceUrl, translateCallStatus } from "~/utils/twilio.server";
import { decrypt } from "~/utils/encryption";

export const action: ActionFunction = async ({ request }) => {
	const twilioSignature = request.headers.get("X-Twilio-Signature") || request.headers.get("x-twilio-signature");
	if (!twilioSignature || Array.isArray(twilioSignature)) {
		return badRequest("Invalid header X-Twilio-Signature");
	}

	const body: Body = await request.json();
	const isOutgoingCall = body.From.startsWith("client:");
	if (isOutgoingCall) {
		const recipient = body.To;
		const organizationId = body.From.slice("client:".length).split("__")[0];

		try {
			const phoneNumber = await db.phoneNumber.findUnique({
				where: { organizationId_isCurrent: { organizationId, isCurrent: true } },
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
							twilioAccount: true,
						},
					},
				},
			});

			if (phoneNumber?.organization.subscriptions.length === 0) {
				// decline the outgoing call because
				// the organization is on the free plan
				return new Response(null, { status: 402 });
			}

			const encryptedAuthToken = phoneNumber?.organization.twilioAccount?.subAccountAuthToken;
			const authToken = encryptedAuthToken ? decrypt(encryptedAuthToken) : "";
			if (
				!phoneNumber ||
				!encryptedAuthToken ||
				!twilio.validateRequest(authToken, twilioSignature, voiceUrl, body)
			) {
				return badRequest("Invalid webhook");
			}

			await db.phoneCall.create({
				data: {
					id: body.CallSid,
					recipient: body.To,
					from: phoneNumber.number,
					to: body.To,
					status: translateCallStatus(body.CallStatus),
					direction: Direction.Outbound,
					duration: "0",
					phoneNumberId: phoneNumber.id,
				},
			});

			const voiceResponse = new twilio.twiml.VoiceResponse();
			const dial = voiceResponse.dial({
				answerOnBridge: true,
				callerId: phoneNumber!.number,
			});
			dial.number(recipient);
			console.log("twiml voiceResponse", voiceResponse.toString());

			return new Response(voiceResponse.toString(), { headers: { "Content-Type": "text/xml" } });
		} catch (error: any) {
			logger.error(error);

			return serverError(error.message);
		}
	}
};

type OutgoingCallBody = {
	AccountSid: string;
	ApiVersion: string;
	ApplicationSid: string;
	CallSid: string;
	CallStatus: CallInstance["status"];
	Called: string;
	Caller: string;
	Direction: `outbound${string}`;
	From: string;
	To: string;
};

type IncomingCallBody = {
	AccountSid: string;
	ApiVersion: string;
	ApplicationSid: string;
	CallSid: string;
	CallStatus: CallInstance["status"];
	Called: string;
	CalledCity: string;
	CalledCountry: string;
	CalledState: string;
	CalledZip: string;
	Caller: string;
	CallerCity: string;
	CallerCountry: string;
	CallerState: string;
	CallerZip: string;
	Direction: "inbound";
	From: string;
	FromCity: string;
	FromCountry: string;
	FromState: string;
	FromZip: string;
	To: string;
	ToCity: string;
	ToCountry: string;
	ToState: string;
	ToZip: string;
};

type Body = OutgoingCallBody | IncomingCallBody;