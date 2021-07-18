import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";

import type { PlanId } from "../subscription/plans";
import { Plan } from "../subscription/plans";
import usePaddle from "./use-paddle";

export default function useSubscription() {
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
		email: string;
		userId: string;
		planId: PlanId;
		coupon?: string;
	};

	async function subscribe(params: BuyParams) {
		const { email, userId, planId, coupon } = params;
		const checkoutOpenParams = {
			email,
			product: planId,
			allowQuantity: false,
			passthrough: JSON.stringify({ userId }),
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
		planId: Plan["id"];
	};

	async function changePlan({ planId }: ChangePlanParams) {
		try {
			await axios.post(
				"/api/subscription/update",
				{ planId },
				{ withCredentials: true },
			);
			router.reload();
		} catch (error) {
			console.log("error", error);
		}
	}

	return {
		subscribe,
		updatePaymentMethod,
		cancelSubscription,
		changePlan,
	};
}
