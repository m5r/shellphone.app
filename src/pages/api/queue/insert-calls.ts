import { Queue } from "quirrel/next";
import type { CallInstance } from "twilio/lib/rest/api/v2010/account/call";

import type { PhoneCall } from "../../../database/phone-call";
import { insertManyPhoneCalls } from "../../../database/phone-call";

type Payload = {
	customerId: string;
	calls: CallInstance[];
}

const insertCallsQueue = Queue<Payload>(
	"api/queue/insert-calls",
	async ({ calls, customerId }) => {
		const phoneCalls = calls
			.map<Omit<PhoneCall, "id">>(call => ({
				customerId,
				twilioSid: call.sid,
				from: call.from,
				to: call.to,
				direction: call.direction === "inbound" ? "inbound" : "outbound",
				status: call.status,
				duration: call.duration,
				createdAt: new Date(call.dateCreated).toISOString(),
			}))
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

		await insertManyPhoneCalls(phoneCalls);
	},
);

export default insertCallsQueue;