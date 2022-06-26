import invariant from "tiny-invariant";

invariant(typeof process.env.APP_BASE_URL === "string", `Please define the "APP_BASE_URL" environment variable`);
invariant(
	typeof process.env.INVITATION_TOKEN_SECRET === "string",
	`Please define the "INVITATION_TOKEN_SECRET" environment variable`,
);
invariant(typeof process.env.SESSION_SECRET === "string", `Please define the "SESSION_SECRET" environment variable`);
invariant(typeof process.env.AWS_SES_REGION === "string", `Please define the "AWS_SES_REGION" environment variable`);
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
	typeof process.env.TWILIO_AUTH_TOKEN === "string",
	`Please define the "TWILIO_AUTH_TOKEN" environment variable`,
);
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
invariant(typeof process.env.SENTRY_DSN === "string", `Please define the "SENTRY_DSN" environment variable`);
invariant(
	typeof process.env.PANELBEAR_SITE_ID === "string",
	`Please define the "PANELBEAR_SITE_ID" environment variable`,
);

export default {
	app: {
		baseUrl: process.env.APP_BASE_URL,
		invitationTokenSecret: process.env.INVITATION_TOKEN_SECRET,
		sessionSecret: process.env.SESSION_SECRET,
		encryptionKey: process.env.MASTER_ENCRYPTION_KEY,
	},
	awsSes: {
		awsRegion: process.env.AWS_SES_REGION,
		accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SES_ACCESS_KEY_SECRET,
		fromEmail: process.env.AWS_SES_FROM_EMAIL,
	},
	panelBear: {
		siteId: process.env.PANELBEAR_SITE_ID,
	},
	redis: {
		url: process.env.REDIS_URL,
		password: process.env.REDIS_PASSWORD,
	},
	sentry: {
		dsn: process.env.SENTRY_DSN,
	},
	twilio: {
		authToken: process.env.TWILIO_AUTH_TOKEN,
	},
	webPush: {
		privateKey: process.env.WEB_PUSH_VAPID_PRIVATE_KEY,
		publicKey: process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
	},
};
