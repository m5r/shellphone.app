import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const isDevMode = process.env.NODE_ENV == "development";

const config = {
	port: +(process.env.PORT || 9029),
	debugLogging: isDevMode,
	databaseUrl: process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/apidb",
	dbEntitiesPath: [
		...isDevMode ? ["src/entity/**/*.ts"] : ["dist/entity/**/*.js"],
	],
	twilio: {
		accountSid: process.env.TWILIO_ACCOUNT_SID!,
		authToken: process.env.TWILIO_AUTH_TOKEN!,
	},
};

export default config;