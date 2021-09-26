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

export async function updateSubscriptionPlan({ subscriptionId, planId, prorate = true }: UpdateSubscriptionPlanParams) {
	const { body } = await request("/subscription/users/update", {
		subscription_id: subscriptionId,
		plan_id: planId,
		prorate,
	});

	return body;
}

export async function cancelPaddleSubscription({ subscriptionId }: { subscriptionId: string }) {
	const { body } = await request("/subscription/users_cancel", { subscription_id: subscriptionId });

	return body;
}
