import Koa from "koa";
import bodyParser from "koa-bodyparser";
import helmet from "koa-helmet";
import cors from "@koa/cors";
import winston from "winston";
import type { ConnectionOptions } from "typeorm";
import { createConnection } from "typeorm";
import "reflect-metadata";

import logger from "./logger";
import config from "./config";
import router from "./router";

const connectionOptions: ConnectionOptions = {
	type: "postgres",
	url: config.databaseUrl,
	synchronize: true,
	logging: false,
	entities: config.dbEntitiesPath,
	extra: {},
};

// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
createConnection(connectionOptions).then(async () => {
	const app = new Koa();

	app.use(helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
			styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
			fontSrc: ["'self'", "fonts.gstatic.com"],
			imgSrc: ["'self'", "data:"],
		},
	}));
	app.use(cors());
	app.use(logger(winston));
	app.use(bodyParser());
	app.use(router.routes()).use(router.allowedMethods());

	app.listen(config.port, () => {
		console.log(`Server running on port ${config.port}`);
	});
}).catch((error: string) => console.log("TypeORM connection error: ", error));
