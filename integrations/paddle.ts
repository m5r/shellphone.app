import { getConfig } from "blitz";
import got from "got";
import type {
	PaddleSdkSubscriptionCreatedEvent,
	PaddleSdkCancelSubscriptionRequest,
	PaddleSdkUpdateSubscriptionRequest,
} from "@devoxa/paddle-sdk";
import { PaddleSdk, PaddleSdkSubscriptionStatus, stringifyMetadata } from "@devoxa/paddle-sdk";

import { SubscriptionStatus } from "db";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

const vendorId = publicRuntimeConfig.paddle.vendorId;
const vendorAuthCode = serverRuntimeConfig.paddle.apiKey;

export const paddleSdk = new PaddleSdk({
	publicKey: serverRuntimeConfig.paddle.publicKey,
	vendorId,
	vendorAuthCode,
	metadataCodec: stringifyMetadata(),
});

export type Metadata = { organizationId: string };

export function translateSubscriptionStatus(
	status: PaddleSdkSubscriptionCreatedEvent<unknown>["status"],
): SubscriptionStatus {
	switch (status) {
		case PaddleSdkSubscriptionStatus.ACTIVE:
			return SubscriptionStatus.active;
		case PaddleSdkSubscriptionStatus.CANCELLED:
			return SubscriptionStatus.deleted;
		case PaddleSdkSubscriptionStatus.PAUSED:
			return SubscriptionStatus.paused;
		case PaddleSdkSubscriptionStatus.PAST_DUE:
			return SubscriptionStatus.past_due;
		case PaddleSdkSubscriptionStatus.TRIALING:
			return SubscriptionStatus.trialing;
		default:
			throw new Error("unreachable");
	}
}

type GetPaymentsParams = {
	subscriptionId: number;
};

export async function getPayments({ subscriptionId }: GetPaymentsParams) {
	type Payment = {
		id: number;
		subscription_id: number;
		amount: number;
		currency: string;
		payout_date: string;
		is_paid: number;
		is_one_off_charge: boolean;
		receipt_url?: string;
	};

	type PaymentsSuccessResponse = {
		success: true;
		response: Payment[];
	};

	type PaymentsErrorResponse = {
		success: false;
		error: {
			code: number;
			message: string;
		};
	};

	type PaymentsResponse = PaymentsSuccessResponse | PaymentsErrorResponse;

	const { body } = await got.post<PaymentsResponse>("https://vendors.paddle.com/api/2.0/subscription/payments", {
		json: {
			subscription_id: subscriptionId,
			vendor_id: vendorId,
			vendor_auth_code: vendorAuthCode,
		},
		responseType: "json",
	});
	if (!body.success) {
		throw new Error(body.error.message);
	}

	return body.response;
}

export async function updateSubscriptionPlan({
	subscriptionId,
	productId,
	shouldProrate = true,
}: PaddleSdkUpdateSubscriptionRequest<Metadata>) {
	return paddleSdk.updateSubscription({
		subscriptionId,
		productId,
		shouldProrate,
	});
}

export async function cancelPaddleSubscription({ subscriptionId }: PaddleSdkCancelSubscriptionRequest) {
	return paddleSdk.cancelSubscription({ subscriptionId });
}
