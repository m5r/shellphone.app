require("dotenv").config();


const contentSecurityPolicy = `
  child-src 'none';
  connect-src *;
  default-src 'self';
  font-src 'self';
  frame-ancestors 'none';
  img-src 'self' data:;
  media-src 'none';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
`;

const nextConfig = {
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					/*{
						key: "Content-Security-Policy",
						value: contentSecurityPolicy.replace(/\n/g, ""),
					},*/
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000; includeSubDomains; preload",
					},
					{
						key: "Permissions-Policy",
						value: "interest-cohort=()",
					},
				],
			},
			{
				source: "/(.*).woff2",
				headers: [
					{
						key: "Cache-Control",
						value:
							"public, immutable, max-age=31536000",
					},
				],
			},
		];
	},
	serverRuntimeConfig: {
		paddle: {
			apiKey: process.env.PADDLE_API_KEY,
			publicKey: process.env.PADDLE_PUBLIC_KEY,
		},
		cookie: {
			secret: process.env.SESSION_COOKIE_SECRET,
		},
		auth0: {
			clientSecret: process.env.AUTH0_CLIENT_SECRET,
			managementClientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
			managementClientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
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
		supabase: {
			roleKey: process.env.SUPABASE_ROLE_KEY,
		},
		masterEncryptionKey: process.env.MASTER_ENCRYPTION_KEY,
	},
	publicRuntimeConfig: {
		paddle: {
			vendorId: process.env.PADDLE_VENDOR_ID,
		},
		auth0: {
			domain: process.env.AUTH0_DOMAIN,
			redirectUri: process.env.AUTH0_REDIRECT_URI,
			clientId: process.env.AUTH0_CLIENT_ID,
		},
		supabase: {
			url: process.env.SUPABASE_URL,
			anonKey: process.env.SUPABASE_ANON_KEY,
		},
	},
};

module.exports = nextConfig;
