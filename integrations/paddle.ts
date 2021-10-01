import { getConfig } from "blitz";
import got from "got";
import type { PaddleSdkSubscriptionCreatedEvent } from "@devoxa/paddle-sdk";
import { PaddleSdk, PaddleSdkSubscriptionStatus, stringifyMetadata } from "@devoxa/paddle-sdk";

import { SubscriptionStatus } from "db";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

const vendor_id = publicRuntimeConfig.paddle.vendorId;
const vendor_auth_code = serverRuntimeConfig.paddle.apiKey;

export const paddleSdk = new PaddleSdk({
	publicKey: serverRuntimeConfig.paddle.publicKey,
	vendorId: vendor_id,
	vendorAuthCode: vendor_auth_code,
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

const client = got.extend({
	prefixUrl: "https://vendors.paddle.com/api/2.0",
});

async function request<T>(path: string, data: any) {
	return client.post<T>(path, {
		json: {
			...data,
			vendor_id,
			vendor_auth_code,
		},
		responseType: "json",
	});
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

	const { body } = await request<PaymentsResponse>("subscription/payments", { subscription_id: subscriptionId });
	console.log("body", typeof body);
	if (!body.success) {
		throw new Error(body.error.message);
	}

	return body.response;
}

type UpdateSubscriptionPlanParams = {
	subscriptionId: number;
	planId: number;
	prorate?: boolean;
};

export async function updateSubscriptionPlan({ subscriptionId, planId, prorate = true }: UpdateSubscriptionPlanParams) {
	const { body } = await request("subscription/users/update", {
		subscription_id: subscriptionId,
		plan_id: planId,
		prorate,
	});

	return body;
}

export async function cancelPaddleSubscription({ subscriptionId }: { subscriptionId: number }) {
	const { body } = await request("subscription/users_cancel", { subscription_id: subscriptionId });

	return body;
}
