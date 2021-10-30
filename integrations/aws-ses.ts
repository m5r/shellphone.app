import type { SendEmailRequest } from "aws-sdk/clients/ses";
import { Credentials, SES } from "aws-sdk";
import { getConfig } from "blitz";

const { serverRuntimeConfig } = getConfig();

const credentials = new Credentials({
	accessKeyId: serverRuntimeConfig.awsSes.accessKeyId,
	secretAccessKey: serverRuntimeConfig.awsSes.secretAccessKey,
});
const ses = new SES({ region: serverRuntimeConfig.awsSes.awsRegion, credentials });

type SendEmailParams = {
	text?: string;
	html: string;
	subject: string;
	recipients: string[];
};

export async function sendEmail({ text, html, subject, recipients }: SendEmailParams) {
	const request: SendEmailRequest = {
		Destination: { ToAddresses: recipients },
		Message: {
			Body: {
				Text: text
					? {
							Charset: "UTF-8",
							Data: text,
					  }
					: undefined,
				Html: {
					Charset: "UTF-8",
					Data: html,
				},
			},
			Subject: {
				Charset: "UTF-8",
				Data: subject,
			},
		},
		Source: serverRuntimeConfig.awsSes.fromEmail,
	};

	await ses.sendEmail(request).promise();
}
