import { useState } from "react";
import clsx from "clsx";
import { type Subscription, SubscriptionStatus } from "@prisma/client";

import SwitchPlanModal from "./switch-plan-modal";

export type Plan = typeof pricing["tiers"][number];

function useSubscription() {
	return {
		hasActiveSubscription: false,
		subscription: null as any,
		subscribe: () => void 0,
		changePlan: () => void 0,
	};
}

export default function Plans() {
	const { hasActiveSubscription, subscription, subscribe, changePlan } = useSubscription();
	const [nextPlan, setNextPlan] = useState<Plan | null>(null);
	const [isSwitchPlanModalOpen, setIsSwitchPlanModalOpen] = useState(false);

	return (
		<>
			<div className="mt-6 flex flex-row flex-wrap gap-2">
				{pricing.tiers.map((tier) => {
					const isCurrentTier = subscription?.paddlePlanId === tier.planId;
					const isActiveTier = hasActiveSubscription && isCurrentTier;
					const cta = getCTA({ subscription, tier });

					return (
						<div
							key={tier.title}
							className={clsx(
								"relative p-2 pt-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-1 min-w-[250px] flex-col",
							)}
						>
							<div className="flex-1 px-2">
								<h3 className="text-xl font-mackinac font-semibold text-gray-900">{tier.title}</h3>
								{tier.yearly ? (
									<p className="absolute top-0 py-1.5 px-4 bg-primary-500 rounded-full text-xs font-semibold uppercase tracking-wide text-white transform -translate-y-1/2">
										Get 2 months free!
									</p>
								) : null}
								<p className="mt-4 flex items-baseline text-gray-900">
									<span className="text-2xl font-extrabold tracking-tight">{tier.price}€</span>
									<span className="ml-1 text-lg font-semibold">{tier.frequency}</span>
								</p>
								{tier.yearly ? (
									<p className="text-gray-500 text-sm">Billed yearly ({tier.price * 12}€)</p>
								) : null}
								<p className="mt-6 text-gray-500">{tier.description}</p>
							</div>

							<button
								disabled={isActiveTier}
								onClick={() => {
									if (hasActiveSubscription) {
										setNextPlan(tier);
										setIsSwitchPlanModalOpen(true);
									} else {
										// subscribe({ planId: tier.planId });
										// Panelbear.track(`Subscribe to ${tier.title}`);
									}
								}}
								className={clsx(
									!isActiveTier
										? "bg-primary-500 text-white hover:bg-primary-600"
										: "bg-primary-50 text-primary-700 cursor-not-allowed",
									"mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium",
								)}
							>
								{cta}
							</button>
						</div>
					);
				})}
			</div>

			<SwitchPlanModal
				isOpen={isSwitchPlanModalOpen}
				nextPlan={nextPlan}
				confirm={(nextPlan: Plan) => {
					// changePlan({ planId: nextPlan.planId });
					// Panelbear.track(`Subscribe to ${nextPlan.title}`);
					setIsSwitchPlanModalOpen(false);
				}}
				closeModal={() => setIsSwitchPlanModalOpen(false)}
			/>
		</>
	);
}

function getCTA({
	subscription,
	tier,
}: {
	subscription?: Subscription;
	tier: typeof pricing["tiers"][number];
}): string {
	if (!subscription) {
		return "Subscribe";
	}

	const isCancelling = subscription.status === SubscriptionStatus.deleted;
	if (isCancelling) {
		return "Resubscribe";
	}

	const isCurrentTier = subscription.paddlePlanId === tier.planId;
	const hasActiveSubscription = subscription.status !== SubscriptionStatus.deleted;
	const isActiveTier = hasActiveSubscription && isCurrentTier;
	if (isActiveTier) {
		return "Current plan";
	}

	return `Switch to ${tier.title}`;
}

const pricing = {
	tiers: [
		{
			title: "Yearly",
			planId: 727544,
			price: 12.5,
			frequency: "/month",
			description: "Text and call anyone, anywhere in the world, all year long.",
			yearly: true,
		},
		{
			title: "Monthly",
			planId: 727540,
			price: 15,
			frequency: "/month",
			description: "Text and call anyone, anywhere in the world.",
			yearly: false,
		},
	],
};
