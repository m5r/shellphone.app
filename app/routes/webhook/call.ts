import { type ActionFunction } from "@remix-run/node";
import { badRequest, serverError } from "remix-utils";
import { z } from "zod";
import { Direction, Prisma, SubscriptionStatus } from "@prisma/client";

import logger from "~/utils/logger.server";
import db from "~/utils/db.server";
import twilio from "twilio";
import { voiceUrl, translateCallStatus } from "~/utils/twilio.server";
import { decrypt } from "~/utils/encryption";
import { validate } from "~/utils/validation.server";
import { notify } from "~/utils/web-push.server";

export const action: ActionFunction = async ({ request }) => {
	const twilioSignature = request.headers.get("X-Twilio-Signature") || request.headers.get("x-twilio-signature");
	if (!twilioSignature || Array.isArray(twilioSignature)) {
		return badRequest("Invalid header X-Twilio-Signature");
	}

	const formData = Object.fromEntries(await request.formData());
	const isOutgoingCall = formData.Caller?.toString().startsWith("client:");
	console.log("isOutgoingCall", isOutgoingCall);
	if (isOutgoingCall) {
		return handleOutgoingCall(formData, twilioSignature);
	}

	return handleIncomingCall(formData, twilioSignature);
};

async function handleIncomingCall(formData: unknown, twilioSignature: string) {
	console.log("formData", formData);
	const validation = validate(validations.incoming, formData);
	if (validation.errors) {
		logger.error(validation.errors);
		return badRequest("");
	}

	const body = validation.data;
	const phoneNumber = await db.phoneNumber.findFirst({
		where: {
			number: body.To,
			twilioAccountSid: body.AccountSid,
		},
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
							memberships: {
								select: { user: true },
							},
						},
					},
				},
			},
		},
	});
	if (!phoneNumber) {
		// this shouldn't be happening
		return new Response(null, { status: 402 });
	}

	if (phoneNumber.twilioAccount.organization.subscriptions.length === 0) {
		// decline the outgoing call because
		// the organization is on the free plan
		console.log("no active subscription"); // TODO: uncomment the line below
		// return new Response(null, { status: 402 });
	}

	const encryptedAuthToken = phoneNumber.twilioAccount.authToken;
	const authToken = encryptedAuthToken ? decrypt(encryptedAuthToken) : "";
	if (!phoneNumber || !encryptedAuthToken || !twilio.validateRequest(authToken, twilioSignature, voiceUrl, body)) {
		return badRequest("Invalid webhook");
	}

	await db.phoneCall.create({
		data: {
			id: body.CallSid,
			recipient: body.From,
			from: body.From,
			to: body.To,
			status: translateCallStatus(body.CallStatus),
			direction: Direction.Outbound,
			duration: "0",
			phoneNumberId: phoneNumber.id,
		},
	});

	// await notify(); TODO
	const user = phoneNumber.twilioAccount.organization.memberships[0].user!;
	const identity = `${phoneNumber.twilioAccount.accountSid}__${user.id}`;
	const voiceResponse = new twilio.twiml.VoiceResponse();
	const dial = voiceResponse.dial({ answerOnBridge: true });
	dial.client(identity);
	console.log("twiml voiceResponse", voiceResponse.toString());

	return new Response(voiceResponse.toString(), { headers: { "Content-Type": "text/xml" } });
}

async function handleOutgoingCall(formData: unknown, twilioSignature: string) {
	const validation = validate(validations.outgoing, formData);
	if (validation.errors) {
		logger.error(validation.errors);
		return badRequest("");
	}

	const body = validation.data;
	const recipient = body.To;
	const accountSid = body.From.slice("client:".length).split("__")[0];

	try {
		const twilioAccount = await db.twilioAccount.findUnique({
			where: { accountSid },
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
		});
		if (!twilioAccount) {
			// this shouldn't be happening
			return new Response(null, { status: 402 });
		}

		const phoneNumber = await db.phoneNumber.findUnique({
			where: { twilioAccountSid_isCurrent: { twilioAccountSid: twilioAccount.accountSid, isCurrent: true } },
		});
		if (!phoneNumber) {
			// this shouldn't be happening
			return new Response(null, { status: 402 });
		}

		if (twilioAccount.organization.subscriptions.length === 0) {
			// decline the outgoing call because
			// the organization is on the free plan
			console.log("no active subscription"); // TODO: uncomment the line below
			// return new Response(null, { status: 402 });
		}

		const encryptedAuthToken = twilioAccount.authToken;
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

const CallStatus = z.union([
	z.literal("busy"),
	z.literal("canceled"),
	z.literal("completed"),
	z.literal("failed"),
	z.literal("in-progress"),
	z.literal("no-answer"),
	z.literal("queued"),
	z.literal("ringing"),
]);

const validations = {
	outgoing: z.object({
		AccountSid: z.string(),
		ApiVersion: z.string(),
		ApplicationSid: z.string(),
		CallSid: z.string(),
		CallStatus,
		Called: z.string(),
		Caller: z.string(),
		// Direction: z.string().refine((direction) => direction.startsWith("outbound")),
		Direction: z.string(),
		From: z.string(),
		To: z.string(),
	}),
	incoming: z.object({
		AccountSid: z.string(),
		ApiVersion: z.string(),
		ApplicationSid: z.string(),
		CallSid: z.string(),
		CallStatus,
		CallToken: z.string(),
		Called: z.string(),
		CalledCity: z.string(),
		CalledCountry: z.string(),
		CalledState: z.string(),
		CalledZip: z.string(),
		Caller: z.string(),
		CallerCity: z.string(),
		CallerCountry: z.string(),
		CallerState: z.string(),
		CallerZip: z.string(),
		Direction: z.literal("inbound"),
		From: z.string(),
		FromCity: z.string(),
		FromCountry: z.string(),
		FromState: z.string(),
		FromZip: z.string(),
		To: z.string(),
		ToCity: z.string(),
		ToCountry: z.string(),
		ToState: z.string(),
		ToZip: z.string(),
	}),
};
