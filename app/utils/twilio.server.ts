import twilio from "twilio";
import type { MessageInstance } from "twilio/lib/rest/api/v2010/account/message";
import type { CallInstance } from "twilio/lib/rest/api/v2010/account/call";
import { type TwilioAccount, CallStatus, Direction, MessageStatus } from "@prisma/client";

import serverConfig from "~/config/config.server";
import { decrypt } from "~/utils/encryption";

export default function getTwilioClient({
	accountSid,
	authToken,
}: Pick<TwilioAccount, "accountSid" | "authToken">): twilio.Twilio {
	if (!accountSid || !authToken) {
		throw new Error("unreachable");
	}

	return twilio(accountSid, decrypt(authToken));
}

export const smsUrl = `${serverConfig.app.baseUrl}/webhook/message`;

export const voiceUrl = `${serverConfig.app.baseUrl}/webhook/call`;

export function getTwiMLName() {
	switch (serverConfig.app.baseUrl) {
		case "https://local.shellphone.app":
			return "Shellphone LOCAL";
		case "https://dev.shellphone.app":
			return "Shellphone DEV";
		case "https://www.shellphone.app":
			return "Shellphone";
	}
}

export function translateMessageStatus(status: MessageInstance["status"]): MessageStatus {
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

export function translateMessageDirection(direction: MessageInstance["direction"]): Direction {
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

export function translateCallStatus(status: CallInstance["status"]): CallStatus {
	switch (status) {
		case "busy":
			return CallStatus.Busy;
		case "canceled":
			return CallStatus.Canceled;
		case "completed":
			return CallStatus.Completed;
		case "failed":
			return CallStatus.Failed;
		case "in-progress":
			return CallStatus.InProgress;
		case "no-answer":
			return CallStatus.NoAnswer;
		case "queued":
			return CallStatus.Queued;
		case "ringing":
			return CallStatus.Ringing;
	}
}

export function translateCallDirection(direction: CallInstance["direction"]): Direction {
	switch (direction) {
		case "inbound":
			return Direction.Inbound;
		case "outbound":
		default:
			return Direction.Outbound;
	}
}
