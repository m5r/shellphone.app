import type { CallInstance } from "twilio/lib/rest/api/v2010/account/call";
import { type PhoneCall, Direction } from "@prisma/client";

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
	logger.info(`Inserting ${calls.length} phone calls for phone number with id=${phoneNumberId}`);
	const phoneNumber = await db.phoneNumber.findUnique({ where: { id: phoneNumberId } });
	if (!phoneNumber) {
		logger.warn(`No phone number found with id=${phoneNumberId}`);
		return;
	}

	const phoneCalls = calls
		.map<PhoneCall>((call) => {
			const direction = translateCallDirection(call.direction);
			const status = translateCallStatus(call.status);
			return {
				phoneNumberId,
				id: call.sid,
				recipient: direction === Direction.Outbound ? call.to : call.from,
				from: call.from,
				to: call.to,
				direction,
				status,
				duration: call.duration,
				createdAt: new Date(call.dateCreated),
			};
		})
		.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

	const { count } = await db.phoneCall.createMany({ data: phoneCalls, skipDuplicates: true });
	logger.info(`Inserted ${count} new phone calls for phone number with id=${phoneNumberId}`);

	if (!phoneNumber.isFetchingCalls) {
		return;
	}

	await db.phoneNumber.update({
		where: { id: phoneNumberId },
		data: { isFetchingCalls: null },
	});
});
