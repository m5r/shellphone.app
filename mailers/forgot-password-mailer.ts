import previewEmail from "preview-email";

import { sendEmail } from "integrations/aws-ses";
import { render, plaintext } from "./renderer";

type ResetPasswordMailer = {
	to: string;
	token: string;
	userName: string;
};

export async function forgotPasswordMailer({ to, token, userName }: ResetPasswordMailer) {
	// In production, set APP_ORIGIN to your production server origin
	const origin = process.env.APP_ORIGIN || process.env.BLITZ_DEV_SERVER_ORIGIN;
	const resetUrl = `${origin}/reset-password?token=${token}`;
	const [html, text] = await Promise.all([
		render("forgot-password", { action_url: resetUrl, name: userName }),
		plaintext("forgot-password", { action_url: resetUrl, name: userName }),
	]);
	const msg = {
		from: "mokhtar@shellphone.app",
		to,
		subject: "Reset your password",
		html,
		text,
	};

	return {
		async send() {
			if (process.env.NODE_ENV === "production") {
				await sendEmail({
					recipients: [msg.to],
					subject: msg.subject,
					html: msg.html,
					text: msg.text,
				});
			} else {
				// Preview email in the browser
				await previewEmail(msg);
			}
		},
	};
}
