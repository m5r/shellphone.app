import previewEmail from "preview-email";

import { sendEmail } from "integrations/aws-ses";
import { render } from "./renderer";

type ResetPasswordMailer = {
	to: string;
	userName: string;
};

export async function subscribeNotificationMailer({ to, userName }: ResetPasswordMailer) {
	const origin = process.env.APP_ORIGIN || process.env.BLITZ_DEV_SERVER_ORIGIN;
	const phoneSettingsUrl = `${origin}/settings/phone`;
	const html = await render("subscribe-notification", { name: userName, phoneSettingsUrl });
	const msg = {
		from: "mokhtar@shellphone.app",
		to,
		subject: "Your Shellphone subscription",
		html,
	};

	return {
		async send() {
			if (process.env.NODE_ENV === "production") {
				return sendEmail({
					recipients: [msg.to],
					subject: msg.subject,
					html: msg.html,
				});
			}

			return previewEmail(msg);
		},
	};
}
