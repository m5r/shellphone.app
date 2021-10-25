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
	publicKey:
		"-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwUABB5uOIIAyJwrJfGIj\nOwueWs4itGIm/5om5HZhbgjGM0f7dnZVBQCCfE+1Dvi9IPkrQaPR83M84JYxRDOA\nbExyg79Lo5nrueinuKtkTOVOCKWmXgtBiuRHGYY90lMhg2I3qY3/DnZDyIyHuprT\n/WU5nVSXP2LLPbOqUjZJysOWIJ2IPbz9no5QdJyge5SudCBa58xa24Us3PiVpmsk\nJ8y0AGxF9AfxFJv/vcUJ0SMnzB6ddWOMcf/fHJwF2urOqU6c66IzJFKf7aytny4n\nqPpNPOkttazUV8ycCXjJAer9peIoTYYcSFqs2pWxg+YSP7EqSSOsqGCuux98q1m7\nBq+eojt9HFMG9ZNaE258gO7G9FhdnLPyMGZC0Q2EeTTohhRNzdzo0iI9BEbVVmLp\nefUZ33IuyDCxtYIiw5vhj/CUBsYhod16GAWLuuCoIfyaGPbaLGGWsecmIsbJx/je\n2MJuHD8PB1f5T9NSLC9MPlptoYlBJjhz7+qBPR8E13aKnRnu7OyDtQ4wi74zPxIr\n0DNcwlbWT3HL7CUDr40glLGx5OxFw4wdIUm6hLy1iC+8vHnY+fyQv+JtaDChP49i\nlSzPrswGaiU/rTkOB6HtGlOci5Skgr1ue1j/lO7y2NcLZMbwDRldGhYXpo0aLQvI\nPzcoXd4HrmEM2friEPLwcn8CAwEAAQ==\n-----END PUBLIC KEY-----",
	vendorId,
	vendorAuthCode,
	metadataCodec: stringifyMetadata(),
});

export type Metadata = { organizationId: string };

export function translateSubscriptionStatus(
	status: PaddleSdkSubscriptionCreatedEvent<Metadata>["status"],
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
	shouldKeepModifiers = true,
	shouldMakeImmediatePayment = true,
}: PaddleSdkUpdateSubscriptionRequest<Metadata>) {
	return paddleSdk.updateSubscription({
		subscriptionId,
		productId,
		shouldProrate,
		shouldKeepModifiers,
		shouldMakeImmediatePayment,
	});
}

export async function cancelPaddleSubscription({ subscriptionId }: PaddleSdkCancelSubscriptionRequest) {
	return paddleSdk.cancelSubscription({ subscriptionId });
}
