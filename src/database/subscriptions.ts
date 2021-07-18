import type { PlanId } from "../subscription/plans";
import appLogger from "../../lib/logger";
import supabase from "../supabase/server";

const logger = appLogger.child({ module: "subscriptions" });

export type SubscriptionStatus =
	| "active"
	| "trialing"
	| "past_due"
	| "paused"
	| "deleted";

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
	"active",
	"trialing",
	"past_due",
	"paused",
	"deleted",
];

export type Subscription = {
	userId: string;
	planId: PlanId;
	paddleCheckoutId: string;
	paddleSubscriptionId: string;
	nextBillDate: Date;
	status: SubscriptionStatus;
	lastEventTime: Date;
	updateUrl: string;
	cancelUrl: string;
	createdAt: Date;
	updatedAt: Date;
};

type CreateSubscriptionParams = Pick<
	Subscription,
	| "userId"
	| "planId"
	| "paddleCheckoutId"
	| "paddleSubscriptionId"
	| "nextBillDate"
	| "status"
	| "updateUrl"
	| "cancelUrl"
	| "lastEventTime"
>;

export async function createSubscription({
	userId,
	planId,
	paddleCheckoutId,
	paddleSubscriptionId,
	nextBillDate,
	status,
	updateUrl,
	cancelUrl,
	lastEventTime,
}: CreateSubscriptionParams): Promise<Subscription> {
	const createdAt = new Date();
	const { data } = await supabase
		.from<Subscription>("subscription")
		.insert({
			userId,
			planId,
			paddleCheckoutId,
			paddleSubscriptionId,
			nextBillDate,
			status,
			updateUrl,
			cancelUrl,
			lastEventTime,
			createdAt,
			updatedAt: createdAt,
		})
		.throwOnError();

	return data![0];
}

type GetSubscriptionParams = Pick<Subscription, "paddleSubscriptionId">;

export async function findSubscription({
	paddleSubscriptionId,
}: GetSubscriptionParams): Promise<Subscription | undefined> {
	const { error, data } = await supabase
		.from<Subscription>("subscription")
		.select("*")
		.eq("paddleSubscriptionId", paddleSubscriptionId)
		.single();

	if (error) throw error;

	return data!;
}

type FindUserSubscriptionParams = Pick<Subscription, "userId">;

export async function findUserSubscription({
	userId,
}: FindUserSubscriptionParams): Promise<Subscription | null> {
	const { error, data } = await supabase
		.from<Subscription>("subscription")
		.select("*")
		.eq("userId", userId)
		.neq("status", "deleted")
		.single();

	if (error) throw error;

	return data!;
}

type UpdateSubscriptionParams = Pick<Subscription, "paddleSubscriptionId"> &
	Partial<
		Pick<
			Subscription,
			| "planId"
			| "paddleCheckoutId"
			| "paddleSubscriptionId"
			| "nextBillDate"
			| "status"
			| "updateUrl"
			| "cancelUrl"
			| "lastEventTime"
		>
	>;

export async function updateSubscription(
	update: UpdateSubscriptionParams,
): Promise<void> {
	const paddleSubscriptionId = update.paddleSubscriptionId;
	await supabase
		.from<Subscription>("subscription")
		.update({
			...update,
			updatedAt: new Date(),
		})
		.eq("paddleSubscriptionId", paddleSubscriptionId)
		.throwOnError();
}

export async function deleteSubscription({
	paddleSubscriptionId,
}: Pick<Subscription, "paddleSubscriptionId">): Promise<void> {
	await supabase
		.from<Subscription>("subscription")
		.delete()
		.eq("paddleSubscriptionId", paddleSubscriptionId)
		.throwOnError();
}
