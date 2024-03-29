import Redis, { type Redis as RedisType, type RedisOptions } from "ioredis";

import serverConfig from "~/config/config.server";

let redis: RedisType;

declare global {
	var __redis: RedisType | undefined;
}

const redisOptions: RedisOptions = {
	maxRetriesPerRequest: null,
	enableReadyCheck: false,
	password: serverConfig.redis.password,
	family: 6, // Fly servers use IPv6 only
	port: 6379,
};

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the Redis with every change either.
if (process.env.NODE_ENV === "production") {
	redis = new Redis(serverConfig.redis.url, redisOptions);
	redis.setMaxListeners(32);
} else {
	if (!global.__redis) {
		global.__redis = new Redis(serverConfig.redis.url, redisOptions);
		global.__redis.setMaxListeners(32);
	}
	redis = global.__redis;
}

export default redis;
