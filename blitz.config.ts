import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz";

const withPWA = require("next-pwa");

export const config: BlitzConfig = {
	middleware: [
		sessionMiddleware({
			cookiePrefix: "virtual-phone-blitz",
			isAuthorized: simpleRolesIsAuthorized,
		}),
	],
	serverRuntimeConfig: {
		paddle: {
			apiKey: process.env.PADDLE_API_KEY,
			publicKey: process.env.PADDLE_PUBLIC_KEY,
		},
		awsSes: {
			awsRegion: process.env.AWS_SES_REGION,
			accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SES_ACCESS_KEY_SECRET,
			fromEmail: process.env.AWS_SES_FROM_EMAIL,
		},
		mailChimp: {
			apiKey: process.env.MAILCHIMP_API_KEY,
			audienceId: process.env.MAILCHIMP_AUDIENCE_ID,
		},
		masterEncryptionKey: process.env.MASTER_ENCRYPTION_KEY,
		app: {
			baseUrl: process.env.APP_BASE_URL,
		},
		webPush: {
			privateKey: process.env.WEB_PUSH_VAPID_PRIVATE_KEY,
		},
	},
	publicRuntimeConfig: {
		webPush: {
			publicKey: process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
		},
	},
	/* Uncomment this to customize the webpack config
	webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
	  // Note: we provide webpack above so you should not `require` it
	  // Perform customizations to webpack config
	  // Important: return the modified config
	  return config
	},
	*/
};

export default process.env.NODE_ENV === "test"
	? config
	: withPWA({
			...config,
			pwa: {
				dest: "public",
				disable: process.env.NODE_ENV !== "production",
			},
	  });
