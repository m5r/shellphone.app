import { Queue } from "quirrel/blitz";

import appLogger from "../../../../integrations/logger";
import { sendEmail } from "../../../../integrations/ses";

const logger = appLogger.child({ queue: "notify-email-change" });

type Payload = {
	oldEmail: string;
	newEmail: string;
};

const notifyEmailChangeQueue = Queue<Payload>("api/queue/notify-email-change", async ({ oldEmail, newEmail }) => {
	await Promise.all([
		sendEmail({
			recipients: [oldEmail],
			subject: "",
			body: "",
		}),
		sendEmail({
			recipients: [newEmail],
			subject: "",
			body: "",
		}),
	]);
});

export default notifyEmailChangeQueue;
