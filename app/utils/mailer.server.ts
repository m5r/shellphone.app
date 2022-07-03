import { type SendMailOptions, createTransport } from "nodemailer";
import { Credentials, SES } from "aws-sdk";
import previewEmail from "preview-email";

import serverConfig from "~/config/config.server";

type SendEmailParams = {
	text?: string;
	html?: string;
	subject: string;
	recipients: string | string[];
};

export default async function sendEmail({ text, html, subject, recipients }: SendEmailParams) {
	const email: SendMailOptions = {
		text,
		html,
		subject,
		encoding: "UTF-8",
		to: recipients,
		from: serverConfig.aws.ses.fromEmail,
	};

	if (process.env.NODE_ENV !== "production" || process.env.CI) {
		return previewEmail(email);
	}

	const transporter = createTransport({
		SES: new SES({
			region: serverConfig.aws.region,
			credentials: new Credentials({
				accessKeyId: serverConfig.aws.ses.accessKeyId,
				secretAccessKey: serverConfig.aws.ses.secretAccessKey,
			}),
		}),
	});

	return transporter.sendMail(email);
}
