import type { ActionFunction } from "@remix-run/node";
import { badRequest } from "remix-utils";
import twilio from "twilio";

import { events } from "~/utils/events.server";
import { validate } from "~/utils/validation.server";
import logger from "~/utils/logger.server";
import { webhookCallValidations } from "~/routes/webhook/call";
import db from "~/utils/db.server";
import { decrypt } from "~/utils/encryption";
import { voiceFallbackUrl } from "~/utils/twilio.server";

export const action: ActionFunction = async ({ request }) => {
	console.log("/incoming/call/fallback");
	const twilioSignature = request.headers.get("X-Twilio-Signature") || request.headers.get("x-twilio-signature");
	if (!twilioSignature || Array.isArray(twilioSignature)) {
		return badRequest("Invalid header X-Twilio-Signature");
	}

	const formData = Object.fromEntries(await request.formData());
	const isOutgoingCall = formData.Caller?.toString().startsWith("client:");
	if (isOutgoingCall) {
		return badRequest("Fallback URL is only for incoming calls");
	}

	const validation = validate(webhookCallValidations.incoming, formData);
	if (validation.errors) {
		logger.error("Invalid webhook data", validation.errors);
		return badRequest("Invalid webhook");
	}

	const body = validation.data;
	const phoneCall = await db.phoneCall.findUnique({
		where: { id: body.CallSid },
		select: {
			phoneNumber: {
				select: {
					twilioAccount: {
						select: {
							accountSid: true,
							authToken: true,
							organization: {
								select: {
									memberships: {
										select: { user: true },
									},
								},
							},
						},
					},
				},
			},
		},
	});
	if (!phoneCall) {
		return badRequest("Invalid webhook");
	}

	const twilioAccount = phoneCall.phoneNumber.twilioAccount;
	const encryptedAuthToken = twilioAccount.authToken;
	const authToken = encryptedAuthToken ? decrypt(encryptedAuthToken) : "";
	if (!encryptedAuthToken || !twilio.validateRequest(authToken, twilioSignature, voiceFallbackUrl, body)) {
		logger.error(`Invalid webhook signature`);
		return badRequest("Invalid webhook");
	}

	// await notify(); TODO
	await waitForDevice();
	console.log("resolved");

	const user = twilioAccount.organization.memberships[0].user!;
	const identity = `${twilioAccount.accountSid}__${user.id}`;
	const voiceResponse = new twilio.twiml.VoiceResponse();
	const dial = voiceResponse.dial({ answerOnBridge: true });
	dial.client(identity);
	console.log("twiml voiceResponse", voiceResponse.toString());

	return new Response(voiceResponse.toString(), { headers: { "Content-Type": "text/xml" } });

	async function waitForDevice() {
		const isDeviceReadyPromise = new Promise<void>((resolve) => events.addListener("readyToAnswer", resolve));
		const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 35_000));

		await Promise.race([isDeviceReadyPromise, timeoutPromise]);
	}
};
