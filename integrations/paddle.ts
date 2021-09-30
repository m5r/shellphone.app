import { getConfig } from "blitz";
import got from "got";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

const vendor_id = publicRuntimeConfig.paddle.vendorId;
const vendor_auth_code = serverRuntimeConfig.paddle.apiKey;

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
	subscriptionId: string;
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
	subscriptionId: string;
	planId: string;
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

export async function cancelPaddleSubscription({ subscriptionId }: { subscriptionId: string }) {
	const { body } = await request("subscription/users_cancel", { subscription_id: subscriptionId });

	return body;
}
