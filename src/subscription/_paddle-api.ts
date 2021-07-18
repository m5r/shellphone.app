import axios from "axios";
import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

const vendor_id = publicRuntimeConfig.paddle.vendorId;
const vendor_auth_code = serverRuntimeConfig.paddle.apiKey;

const client = axios.create({
	baseURL: "https://vendors.paddle.com/api/2.0",
});

async function request<T>(path: string, data: any) {
	return client.post<T>(path, {
		...data,
		vendor_id,
		vendor_auth_code,
	});
}

type UpdateSubscriptionPlanParams = {
	subscriptionId: string;
	planId: string;
	prorate?: boolean;
};

export async function updateSubscriptionPlan({
	subscriptionId,
	planId,
	prorate = true,
}: UpdateSubscriptionPlanParams) {
	const { data } = await request("/subscription/users/update", {
		subscription_id: subscriptionId,
		plan_id: planId,
		prorate,
	});

	return data;
}

export async function cancelPaddleSubscription({
	subscriptionId,
}: {
	subscriptionId: string;
}) {
	const { data } = await request("/subscription/users_cancel", {
		subscription_id: subscriptionId,
	});

	return data;
}
