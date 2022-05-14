import sendEmail from "~/utils/mailer.server";
import serverConfig from "~/config/config.server";
import { render } from "./renderer/renderer.server";

type Params = {
	to: string;
	token: string;
	userName: string;
};

export async function sendForgotPasswordEmail({ to, token, userName }: Params) {
	const origin = serverConfig.app.baseUrl;
	const resetUrl = `${origin}/reset-password?token=${token}`;
	const html = await render("forgot-password", { action_url: resetUrl, name: userName });

	return sendEmail({
		recipients: to,
		subject: "Reset your password",
		html,
	});
}
