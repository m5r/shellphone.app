import type { PlanId } from "../subscription/plans";
import appLogger from "../../lib/logger";

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

type FirestoreSubscription = FirestoreEntry<Subscription>;

const subscriptions = firestoreCollection<FirestoreSubscription>(
	"subscriptions",
);

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
	const createdAt = FieldValue.serverTimestamp() as Timestamp;
	await subscriptions.doc(paddleSubscriptionId).set({
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
	});

	const subscription = await findSubscription({ paddleSubscriptionId });

	return subscription!;
}

type GetSubscriptionParams = Pick<Subscription, "paddleSubscriptionId">;

export async function findSubscription({
	paddleSubscriptionId,
}: GetSubscriptionParams): Promise<Subscription | undefined> {
	const subscriptionDocument = await subscriptions
		.doc(paddleSubscriptionId)
		.get();
	if (!subscriptionDocument.exists) {
		return;
	}

	return convertFromFirestore(subscriptionDocument.data()!);
}

type FindUserSubscriptionParams = Pick<Subscription, "userId">;

export async function findUserSubscription({
	userId,
}: FindUserSubscriptionParams): Promise<Subscription | null> {
	const subscriptionDocumentsSnapshot = await subscriptions
		.where("userId", "==", userId)
		.where("status", "!=", "deleted")
		.get();
	if (subscriptionDocumentsSnapshot.docs.length === 0) {
		logger.warn(`No subscription found for user ${userId}`);
		return null;
	}

	const subscriptionDocument = subscriptionDocumentsSnapshot.docs[0].data();

	return convertFromFirestore(subscriptionDocument);
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
	await subscriptions.doc(paddleSubscriptionId).set(
		{
			...update,
			updatedAt: FieldValue.serverTimestamp() as Timestamp,
		},
		{ merge: true },
	);
}

export async function deleteSubscription({
	paddleSubscriptionId,
}: Pick<Subscription, "paddleSubscriptionId">): Promise<void> {
	await subscriptions.doc(paddleSubscriptionId).delete();
}
