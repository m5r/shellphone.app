/// <reference path='./next-pwa.d.ts' />
import type { BlitzConfig } from "blitz";
import { sessionMiddleware, simpleRolesIsAuthorized } from "blitz";
import SentryWebpackPlugin from "@sentry/webpack-plugin";
// import withPWA from "next-pwa";

type Module = Omit<NodeModule, "exports"> & { exports: BlitzConfig };

const { SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN, NODE_ENV, GITHUB_SHA } = process.env;

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
	productionBrowserSourceMaps: true,
	env: {
		SENTRY_DSN: process.env.SENTRY_DSN,
	},
	serverRuntimeConfig: {
		rootDir: __dirname,
		masterEncryptionKey: process.env.MASTER_ENCRYPTION_KEY,
		paddle: {
			apiKey: process.env.PADDLE_API_KEY,
		},
		awsSes: {
			awsRegion: process.env.AWS_SES_REGION,
			accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SES_ACCESS_KEY_SECRET,
			fromEmail: process.env.AWS_SES_FROM_EMAIL,
		},
		awsS3: {
			awsRegion: process.env.AWS_S3_REGION,
			accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_S3_ACCESS_KEY_SECRET,
		},
		mailChimp: {
			apiKey: process.env.MAILCHIMP_API_KEY,
			audienceId: process.env.MAILCHIMP_AUDIENCE_ID,
		},
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
		paddle: {
			vendorId: process.env.PADDLE_VENDOR_ID,
		},
	},
	// @ts-ignore
	webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
		// In `pages/_app.js`, Sentry is imported from @sentry/browser. While
		// @sentry/node will run in a Node.js environment. @sentry/node will use
		// Node.js-only APIs to catch even more unhandled exceptions.
		//
		// This works well when Next.js is SSRing your page on a server with
		// Node.js, but it is not what we want when your client-side bundle is being
		// executed by a browser.
		//
		// Luckily, Next.js will call this webpack function twice, once for the
		// server and once for the client. Read more:
		// https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
		//
		// So ask Webpack to replace @sentry/node imports with @sentry/browser when
		// building the browser's bundle
		if (!isServer) {
			config.resolve.alias["@sentry/node"] = "@sentry/browser";
		}

		// When all the Sentry configuration env variables are available/configured
		// The Sentry webpack plugin gets pushed to the webpack plugins to build
		// and upload the source maps to sentry.
		// This is an alternative to manually uploading the source maps
		// Note: This is disabled in development mode.
		if (
			SENTRY_DSN &&
			SENTRY_ORG &&
			SENTRY_PROJECT &&
			SENTRY_AUTH_TOKEN &&
			GITHUB_SHA &&
			NODE_ENV === "production"
		) {
			config.plugins.push(
				new SentryWebpackPlugin({
					include: ".next",
					ignore: ["node_modules"],
					stripPrefix: ["webpack://_N_E/"],
					urlPrefix: `~/_next`,
					release: GITHUB_SHA,
				}),
			);
		}

		return config;
	},
	/*pwa: {
		dest: "public",
		disable: process.env.NODE_ENV !== "production",
	},*/
};
