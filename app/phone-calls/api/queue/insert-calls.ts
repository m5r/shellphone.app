import { Queue } from "quirrel/blitz";
import type { CallInstance } from "twilio/lib/rest/api/v2010/account/call";

import db, { Direction, CallStatus } from "../../../../db";

type Payload = {
	organizationId: string;
	phoneNumberId: string;
	calls: CallInstance[];
};

const insertCallsQueue = Queue<Payload>("api/queue/insert-calls", async ({ calls, organizationId, phoneNumberId }) => {
	const phoneNumber = await db.phoneNumber.findFirst({
		where: { id: phoneNumberId, organizationId },
		include: { organization: true },
	});
	if (!phoneNumber) {
		return;
	}

	const phoneCalls = calls
		.map((call) => ({
			organizationId,
			phoneNumberId,
			id: call.sid,
			from: call.from,
			to: call.to,
			direction: translateDirection(call.direction),
			status: translateStatus(call.status),
			duration: call.duration,
			createdAt: new Date(call.dateCreated),
		}))
		.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

	await db.phoneCall.createMany({ data: phoneCalls, skipDuplicates: true });
});

export default insertCallsQueue;

function translateDirection(direction: CallInstance["direction"]): Direction {
	switch (direction) {
		case "inbound":
			return Direction.Inbound;
		case "outbound":
		default:
			return Direction.Outbound;
	}
}

function translateStatus(status: CallInstance["status"]): CallStatus {
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
