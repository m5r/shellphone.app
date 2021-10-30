import previewEmail from "preview-email";

import { sendEmail } from "integrations/aws-ses";
import { render } from "./renderer";

type ResetPasswordMailer = {
	to: string;
	userName: string;
};

export async function welcomeMailer({ to, userName }: ResetPasswordMailer) {
	const html = await render("welcome", { name: userName });
	const msg = {
		from: "mokhtar@shellphone.app",
		to,
		subject: "Welcome to Shellphone",
		html,
	};

	return {
		async send() {
			if (process.env.NODE_ENV === "production") {
				await sendEmail({
					recipients: [msg.to],
					subject: msg.subject,
					html: msg.html,
				});
			} else {
				// Preview email in the browser
				return await previewEmail(msg);
			}
		},
	};
}
