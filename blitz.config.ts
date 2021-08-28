/// <reference path='./next-pwa.d.ts' />
import type { BlitzConfig } from "blitz";
import { sessionMiddleware, simpleRolesIsAuthorized } from "blitz";
// import withPWA from "next-pwa";

type Module = Omit<NodeModule, "exports"> & { exports: BlitzConfig };

(module as Module).exports = {
	async header() {
		return [
			{
				source: "/fonts/*.woff2",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
	async rewrites() {
		return [
			{
				source: "/bear.js",
				destination: "https://cdn.panelbear.com/analytics.js",
			},
		];
	},
	middleware: [
		sessionMiddleware({
			cookiePrefix: "shellphone",
			isAuthorized: simpleRolesIsAuthorized,
		}),
	],
	images: {
		domains: ["www.datocms-assets.com"],
	},
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
		datoCms: {
			apiToken: process.env.DATOCMS_API_TOKEN,
			previewSecret: process.env.DATOCMS_PREVIEW_SECRET,
		},
	},
	publicRuntimeConfig: {
		webPush: {
			publicKey: process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
		},
		panelBear: {
			siteId: process.env.PANELBEAR_SITE_ID,
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
	/*pwa: {
		dest: "public",
		disable: process.env.NODE_ENV !== "production",
	},*/
};
