import { type Processor, type JobsOptions, Queue as BullQueue, Worker, QueueScheduler } from "bullmq";

import redis from "./redis.server";
import logger from "./logger.server";

type RegisteredQueue = {
	queue: BullQueue;
	worker: Worker;
	scheduler: QueueScheduler;
};

declare global {
	var __registeredQueues: Map<string, RegisteredQueue> | undefined;
}

const registeredQueues = global.__registeredQueues || (global.__registeredQueues = new Map<string, RegisteredQueue>());

export function Queue<Payload>(
	name: string,
	handler: Processor<Payload>,
	defaultJobOptions: JobsOptions = {},
): BullQueue<Payload> {
	if (registeredQueues.has(name)) {
		return registeredQueues.get(name)!.queue;
	}

	const jobOptions: JobsOptions = {
		attempts: 3,
		backoff: { type: "exponential", delay: 1000 },
		...defaultJobOptions,
	};
	const queue = new BullQueue<Payload>(name, {
		defaultJobOptions: jobOptions,
		connection: redis,
	});
	queue.on("error", (error) => logger.error(`queue:${name}:error`, error));
	queue.on("cleaned", (jobs, type) =>
		logger.debug(`queue:${name}:cleaned`, `${jobs.length} jobs cleaned (type=${type})`),
	);
	queue.on("waiting", (job) => logger.debug(`queue:${name}:waiting`, `job "${job.name}" is waiting`));
	queue.on("paused", () => logger.debug(`queue:${name}:paused`));
	queue.on("resumed", () => logger.debug(`queue:${name}:resumed`));
	queue.on("ioredis:close", () => logger.debug(`queue:${name}:ioredis:close`));
	queue.on("removed", (job) => logger.debug(`queue:${name}:removed`, `job "${job.name}" has been removed`));
	queue.on("progress", (job, progress) =>
		logger.debug(`queue:${name}:progress`, `job "${job.name}" has progressed => ${progress}`),
	);

	const worker = new Worker<Payload>(
		name,
		async (job, token) => {
			try {
				const res = await handler(job, token);
				logger.debug(`queue:${name}:worker-success`, `worker finished job ${job.name}`);
				return res;
			} catch (error) {
				logger.error(`queue:${name}:worker-error`, `worker error for job ${job.name}`, error);
				return null;
			}
		},
		{ connection: redis },
	);
	worker.on("failed", (job, error, prev) =>
		logger.error(`job "${job.name}" failed with error ${error} (prev=${prev})`),
	);
	worker.on("completed", (job, error, prev) =>
		logger.debug(`job "${job.name}" completed (error=${error}) (prev=${prev})`),
	);

	worker.on("error", (error) => logger.error(`worker:${name}:error`, error));
	worker.on("paused", () => logger.debug(`worker:${name}:paused`));
	worker.on("resumed", () => logger.debug(`worker:${name}:resumed`));
	worker.on("ioredis:close", () => logger.debug(`worker:${name}:ioredis:close`));
	worker.on("progress", (job, progress) =>
		logger.debug(`worker:${name}:progress`, `job "${job.name}" has progressed => ${progress}`),
	);
	worker.on("active", (job) => logger.debug(`worker:${name}:active job "${job.name}"`));
	worker.on("closed", () => logger.debug(`worker:${name}:closed`));
	worker.on("closing", (msg) => logger.debug(`worker:${name}:closing msg="${msg}"`));
	worker.on("drained", () => logger.debug(`worker:${name}:drained`));

	const scheduler = new QueueScheduler(name, { connection: redis });
	registeredQueues.set(name, { queue, worker, scheduler });

	return queue;
}
