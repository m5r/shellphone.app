import { Queue } from "quirrel/blitz";

import appLogger from "integrations/logger";
import { sendEmail } from "integrations/aws-ses";

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
			text: "",
			html: "",
		}),
		sendEmail({
			recipients: [newEmail],
			subject: "",
			text: "",
			html: "",
		}),
	]);
});

export default notifyEmailChangeQueue;
