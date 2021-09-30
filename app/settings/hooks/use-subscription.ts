import { useEffect, useRef } from "react";
import { useQuery, useMutation, useRouter, useSession } from "blitz";

import type { Subscription } from "db";
import getSubscription from "../queries/get-subscription";
import getPayments from "../queries/get-payments";
import usePaddle from "./use-paddle";
import useCurrentUser from "../../core/hooks/use-current-user";
import updateSubscription from "../mutations/update-subscription";

type Params = {
	initialData?: Subscription;
};

export default function useSubscription({ initialData }: Params = {}) {
	const session = useSession();
	const { user } = useCurrentUser();
	const [subscription] = useQuery(getSubscription, null, { initialData });
	const [payments] = useQuery(getPayments, null);
	const [updateSubscriptionMutation] = useMutation(updateSubscription);

	const router = useRouter();
	const resolve = useRef<() => void>();
	const promise = useRef<Promise<void>>();

	const { Paddle } = usePaddle({
		eventCallback(data) {
			if (["Checkout.Close", "Checkout.Complete"].includes(data.event)) {
				resolve.current!();
				promise.current = new Promise((r) => (resolve.current = r));
			}
		},
	});

	useEffect(() => {
		promise.current = new Promise((r) => (resolve.current = r));
	}, []);

	type BuyParams = {
		planId: string;
		coupon?: string;
	};

	async function subscribe(params: BuyParams) {
		if (!user || !session.orgId) {
			return;
		}

		const { planId, coupon } = params;
		const checkoutOpenParams = {
			email: user.email,
			product: planId,
			allowQuantity: false,
			passthrough: JSON.stringify({ organizationId: session.orgId }),
			coupon: "",
		};

		if (coupon) {
			checkoutOpenParams.coupon = coupon;
		}

		Paddle.Checkout.open(checkoutOpenParams);

		return promise.current;
	}

	async function updatePaymentMethod({ updateUrl }: { updateUrl: string }) {
		const checkoutOpenParams = { override: updateUrl };

		Paddle.Checkout.open(checkoutOpenParams);

		return promise.current;
	}

	async function cancelSubscription({ cancelUrl }: { cancelUrl: string }) {
		const checkoutOpenParams = { override: cancelUrl };

		Paddle.Checkout.open(checkoutOpenParams);

		return promise.current;
	}

	type ChangePlanParams = {
		planId: string;
	};

	async function changePlan({ planId }: ChangePlanParams) {
		try {
			await updateSubscriptionMutation({ planId });
			router.reload();
		} catch (error) {
			console.log("error", error);
		}
	}

	return {
		subscription,
		payments,
		subscribe,
		updatePaymentMethod,
		cancelSubscription,
		changePlan,
	};
}
