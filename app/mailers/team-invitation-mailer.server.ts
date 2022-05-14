import sendEmail from "~/utils/mailer.server";
import serverConfig from "~/config/config.server";
import { render } from "./renderer/renderer.server";

type Params = {
	to: string;
	token: string;
	userName: string;
	organizationName: string;
};

export async function sendTeamInvitationEmail({ to, token, userName, organizationName }: Params) {
	const origin = serverConfig.app.baseUrl;
	const invitationUrl = `${origin}/accept-invitation?token=${token}`;
	const html = await render("team-invitation", {
		action_url: invitationUrl,
		invitation_sender_name: userName,
		invitation_sender_organization_name: organizationName,
	});

	return sendEmail({
		recipients: to,
		subject: `${userName} has invited you to work with them in Remixtape`,
		html,
	});
}
