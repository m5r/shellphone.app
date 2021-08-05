import { Queue } from "quirrel/blitz";
import twilio from "twilio";

import db from "../../../../db";
import insertCallsQueue from "./insert-calls";

type Payload = {
	organizationId: string;
	phoneNumberId: string;
};

const fetchCallsQueue = Queue<Payload>("api/queue/fetch-calls", async ({ organizationId, phoneNumberId }) => {
	const phoneNumber = await db.phoneNumber.findFirst({
		where: { id: phoneNumberId, organizationId },
		include: { organization: true },
	});
	if (!phoneNumber) {
		return;
	}

	const organization = phoneNumber.organization;
	if (!organization.twilioAccountSid || !organization.twilioAuthToken) {
		return;
	}

	const [callsSent, callsReceived] = await Promise.all([
		twilio(organization.twilioAccountSid, organization.twilioAuthToken).calls.list({
			from: phoneNumber.number,
		}),
		twilio(organization.twilioAccountSid, organization.twilioAuthToken).calls.list({
			to: phoneNumber.number,
		}),
	]);
	const calls = [...callsSent, ...callsReceived].sort((a, b) => a.dateCreated.getTime() - b.dateCreated.getTime());

	await insertCallsQueue.enqueue(
		{
			organizationId,
			phoneNumberId,
			calls,
		},
		{
			id: `insert-calls-${organizationId}-${phoneNumberId}`,
		},
	);
});

export default fetchCallsQueue;
