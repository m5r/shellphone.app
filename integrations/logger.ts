import pino from "pino"

const appLogger = pino({
	level: "debug",
	base: {
		env: process.env.NODE_ENV || "NODE_ENV not set",
		revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
	},
	prettyPrint: true,
})

export default appLogger
