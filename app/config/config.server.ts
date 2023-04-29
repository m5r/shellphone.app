import invariant from "tiny-invariant";

invariant(typeof process.env.APP_BASE_URL === "string", `Please define the "APP_BASE_URL" environment variable`);
invariant(
	typeof process.env.INVITATION_TOKEN_SECRET === "string",
	`Please define the "INVITATION_TOKEN_SECRET" environment variable`,
);
invariant(typeof process.env.SESSION_SECRET === "string", `Please define the "SESSION_SECRET" environment variable`);
invariant(typeof process.env.AWS_REGION === "string", `Please define the "AWS_REGION" environment variable`);
invariant(
	typeof process.env.AWS_S3_ACCESS_KEY_ID === "string",
	`Please define the "AWS_S3_ACCESS_KEY_ID" environment variable`,
);
invariant(
	typeof process.env.AWS_S3_ACCESS_KEY_SECRET === "string",
	`Please define the "AWS_S3_ACCESS_KEY_SECRET" environment variable`,
);
invariant(
	typeof process.env.AWS_SES_ACCESS_KEY_ID === "string",
	`Please define the "AWS_SES_ACCESS_KEY_ID" environment variable`,
);
invariant(
	typeof process.env.AWS_SES_ACCESS_KEY_SECRET === "string",
	`Please define the "AWS_SES_ACCESS_KEY_SECRET" environment variable`,
);
invariant(
	typeof process.env.AWS_SES_FROM_EMAIL === "string",
	`Please define the "AWS_SES_FROM_EMAIL" environment variable`,
);
invariant(typeof process.env.REDIS_URL === "string", `Please define the "REDIS_URL" environment variable`);
invariant(
	typeof process.env.MASTER_ENCRYPTION_KEY === "string",
	`Please define the "MASTER_ENCRYPTION_KEY" environment variable`,
);
invariant(
	typeof process.env.WEB_PUSH_VAPID_PRIVATE_KEY === "string",
	`Please define the "WEB_PUSH_VAPID_PRIVATE_KEY" environment variable`,
);
invariant(
	typeof process.env.WEB_PUSH_VAPID_PUBLIC_KEY === "string",
	`Please define the "WEB_PUSH_VAPID_PUBLIC_KEY" environment variable`,
);
invariant(
	typeof process.env.MAILCHIMP_API_KEY === "string",
	`Please define the "MAILCHIMP_API_KEY" environment variable`,
);
invariant(
	typeof process.env.MAILCHIMP_AUDIENCE_ID === "string",
	`Please define the "MAILCHIMP_AUDIENCE_ID" environment variable`,
);
invariant(
	typeof process.env.DISCORD_WEBHOOK_ID === "string",
	`Please define the "DISCORD_WEBHOOK_ID" environment variable`,
);
invariant(
	typeof process.env.DISCORD_WEBHOOK_TOKEN === "string",
	`Please define the "DISCORD_WEBHOOK_TOKEN" environment variable`,
);

export default {
	app: {
		baseUrl: process.env.APP_BASE_URL,
		invitationTokenSecret: process.env.INVITATION_TOKEN_SECRET,
		sessionSecret: process.env.SESSION_SECRET,
		encryptionKey: process.env.MASTER_ENCRYPTION_KEY,
	},
	aws: {
		region: process.env.AWS_REGION,
		ses: {
			accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SES_ACCESS_KEY_SECRET,
			fromEmail: process.env.AWS_SES_FROM_EMAIL,
		},
		s3: {
			accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_S3_ACCESS_KEY_SECRET,
		},
	},
	discord: {
		webhookId: process.env.DISCORD_WEBHOOK_ID,
		webhookToken: process.env.DISCORD_WEBHOOK_TOKEN,
	},
	mailchimp: {
		apiKey: process.env.MAILCHIMP_API_KEY,
		audienceId: process.env.MAILCHIMP_AUDIENCE_ID,
	},
	redis: {
		url: process.env.REDIS_URL,
		password: process.env.REDIS_PASSWORD,
	},
	webPush: {
		privateKey: process.env.WEB_PUSH_VAPID_PRIVATE_KEY,
		publicKey: process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
	},
};
