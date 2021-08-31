import { Queue } from "quirrel/blitz";

import db from "../../../../db";
import getTwilioClient, { translateCallStatus } from "../../../../integrations/twilio";

type Payload = {
	organizationId: string;
	callId: string;
};

const updateCallDurationQueue = Queue<Payload>("api/queue/update-call-duration", async ({ organizationId, callId }) => {
	const organization = await db.organization.findFirst({ where: { id: organizationId } });
	const twilioClient = getTwilioClient(organization);
	const call = await twilioClient.calls.get(callId).fetch();

	await db.phoneCall.update({
		where: { id: callId },
		data: { duration: call.duration, status: translateCallStatus(call.status) },
	});

	const callHasFinished = ["completed", "busy", "no-answer", "canceled", "failed"].includes(call.status);
	if (!callHasFinished) {
		await updateCallDurationQueue.enqueue({ organizationId, callId }, { delay: "30s" });
	}
});

export default updateCallDurationQueue;
