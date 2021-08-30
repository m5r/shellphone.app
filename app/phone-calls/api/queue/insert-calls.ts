import { Queue } from "quirrel/blitz";
import type { CallInstance } from "twilio/lib/rest/api/v2010/account/call";

import db from "../../../../db";
import { translateCallDirection, translateCallStatus } from "../../../../integrations/twilio";

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
			direction: translateCallDirection(call.direction),
			status: translateCallStatus(call.status),
			duration: call.duration,
			createdAt: new Date(call.dateCreated),
		}))
		.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

	await db.phoneCall.createMany({ data: phoneCalls, skipDuplicates: true });
});

export default insertCallsQueue;
