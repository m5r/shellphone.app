import type { CallInstance } from "twilio/lib/rest/api/v2010/account/call";
import type { PhoneCall } from "@prisma/client";

import { Queue } from "~/utils/queue.server";
import db from "~/utils/db.server";
import { translateCallDirection, translateCallStatus } from "~/utils/twilio.server";
import logger from "~/utils/logger.server";

type Payload = {
	phoneNumberId: string;
	calls: CallInstance[];
};

export default Queue<Payload>("insert phone calls", async ({ data }) => {
	const { calls, phoneNumberId } = data;
	const phoneNumber = await db.phoneNumber.findUnique({
		where: { id: phoneNumberId },
		include: { organization: true },
	});
	if (!phoneNumber) {
		return;
	}

	const phoneCalls = calls
		.map<PhoneCall>((call) => ({
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

	const ddd = await db.phoneCall.createMany({ data: phoneCalls, skipDuplicates: true });
	logger.info(`inserted ${ddd.count || "no"} new phone calls for phoneNumberId=${phoneNumberId}`);

	if (!phoneNumber.isFetchingCalls) {
		return;
	}

	await db.phoneNumber.update({
		where: { id: phoneNumberId },
		data: { isFetchingCalls: null },
	});
});
