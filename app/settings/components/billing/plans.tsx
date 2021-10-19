import { HiCheck } from "react-icons/hi";
import * as Panelbear from "@panelbear/panelbear-js";
import clsx from "clsx";

import useSubscription from "../../hooks/use-subscription";

export default function Plans() {
	const { hasActiveSubscription, subscription, subscribe, changePlan } = useSubscription();

	return (
		<div className="mt-6 flex flex-row-reverse flex-wrap-reverse gap-x-4">
			{pricing.tiers.map((tier) => {
				const isFreeTier = tier.planId === -1;
				const isCurrentTier = subscription?.paddlePlanId === tier.planId;
				const isActiveTier = (!hasActiveSubscription && isFreeTier) || (hasActiveSubscription && isCurrentTier);
				const cta = isActiveTier ? "Current plan" : !!subscription ? `Switch to ${tier.title}` : "Subscribe";

				return (
					<div
						key={tier.title}
						className={clsx(
							tier.yearly && "mb-4",
							"relative p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-grow w-1/3 flex-col",
						)}
					>
						<div className="flex-1">
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

							<ul role="list" className="mt-6 space-y-6">
								{tier.features.map((feature) => (
									<li key={feature} className="flex">
										<HiCheck className="flex-shrink-0 w-6 h-6 text-[#0eb56f]" aria-hidden="true" />
										<span className="ml-3 text-gray-500">{feature}</span>
									</li>
								))}
								{tier.unavailableFeatures.map((feature) => (
									<li key={feature} className="flex">
										<span className="ml-9 text-gray-400">
											{~feature.indexOf("(coming soon)")
												? feature.slice(0, feature.indexOf("(coming soon)"))
												: feature}
										</span>
									</li>
								))}
							</ul>
						</div>

						<button
							disabled={isActiveTier}
							onClick={() => {
								if (hasActiveSubscription) {
									changePlan({ planId: tier.planId });
									Panelbear.track(`Subscribe to ${tier.title}`);
								} else {
									subscribe({ planId: tier.planId, coupon: "groot429" });
									Panelbear.track(`Subscribe to ${tier.title}`);
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
	);
}

const paidFeatures = [
	"SMS",
	"MMS (coming soon)",
	"Calls",
	"SMS forwarding (coming soon)",
	"Call forwarding (coming soon)",
	"Voicemail (coming soon)",
	"Call recording (coming soon)",
];
const pricing = {
	tiers: [
		{
			title: "Free",
			planId: -1,
			price: 0,
			frequency: "",
			description: "The essentials to let you try Shellphone.",
			features: ["SMS (send only)"],
			unavailableFeatures: paidFeatures.slice(1),
			cta: "Subscribe",
			yearly: false,
		},
		{
			title: "Monthly",
			planId: 727540,
			price: 15,
			frequency: "/month",
			description: "Text and call anyone, anywhere in the world.",
			features: paidFeatures,
			unavailableFeatures: [],
			cta: "Subscribe",
			yearly: false,
		},
		{
			title: "Yearly",
			planId: 727544,
			price: 12.5,
			frequency: "/month",
			description: "Text and call anyone, anywhere in the world, all year long.",
			features: paidFeatures,
			unavailableFeatures: [],
			cta: "Subscribe",
			yearly: true,
		},
	],
};
