import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useSession } from "blitz";

import type { Subscription } from "db";
import { SubscriptionStatus } from "db";
import getSubscription from "app/settings/queries/get-subscription";
import updateSubscription from "app/settings/mutations/update-subscription";
import usePaddle from "app/settings/hooks/use-paddle";
import useCurrentUser from "app/core/hooks/use-current-user";

type Params = {
	initialData?: Subscription;
};

export default function useSubscription({ initialData }: Params = {}) {
	const session = useSession();
	const { user } = useCurrentUser();
	const [isWaitingForSubChange, setIsWaitingForSubChange] = useState(false);
	const [subscription] = useQuery(getSubscription, null, {
		initialData,
		refetchInterval: isWaitingForSubChange ? 1500 : false,
	});
	const [updateSubscriptionMutation] = useMutation(updateSubscription);

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

	// cancel subscription polling when we get a new subscription
	useEffect(() => setIsWaitingForSubChange(false), [subscription?.paddleSubscriptionId, subscription?.status]);

	useEffect(() => {
		promise.current = new Promise((r) => (resolve.current = r));
	}, []);

	type BuyParams = {
		planId: number;
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
		setIsWaitingForSubChange(true);

		return promise.current;
	}

	async function updatePaymentMethod({ updateUrl }: { updateUrl: string }) {
		const checkoutOpenParams = { override: updateUrl };

		Paddle.Checkout.open(checkoutOpenParams);
		setIsWaitingForSubChange(true);

		return promise.current;
	}

	async function cancelSubscription({ cancelUrl }: { cancelUrl: string }) {
		const checkoutOpenParams = { override: cancelUrl };

		Paddle.Checkout.open(checkoutOpenParams);
		setIsWaitingForSubChange(true);

		return promise.current;
	}

	type ChangePlanParams = {
		planId: number;
	};

	async function changePlan({ planId }: ChangePlanParams) {
		if (planId === -1) {
			return cancelSubscription({ cancelUrl: subscription!.cancelUrl });
		}

		try {
			await updateSubscriptionMutation({ planId });
		} catch (error) {
			console.log("error", error);
		}
	}

	const hasActiveSubscription = Boolean(subscription && subscription?.status !== SubscriptionStatus.deleted);

	return {
		subscription,
		hasActiveSubscription,
		subscribe,
		updatePaymentMethod,
		cancelSubscription,
		changePlan,
	};
}
