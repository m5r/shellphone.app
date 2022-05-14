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
	const worker = new Worker<Payload>(name, handler, { connection: redis });
	const scheduler = new QueueScheduler(name, { connection: redis });
	registeredQueues.set(name, { queue, worker, scheduler });

	return queue;
}

export function CronJob(
	name: string,
	handler: Processor<undefined>,
	cronSchedule: string,
	defaultJobOptions: Exclude<JobsOptions, "repeat"> = {},
) {
	const jobOptions: JobsOptions = {
		...defaultJobOptions,
		repeat: { cron: cronSchedule },
	};

	return function register() {
		if (registeredQueues.has(name)) {
			return registeredQueues.get(name)!.queue;
		}

		const queue = Queue<undefined>(name, handler, jobOptions);
		queue.add(name, undefined, jobOptions);
		logger.info(`registered cron job "${name}"`);
		return queue;
	};
}
