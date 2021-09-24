import type { BlitzPage } from "blitz";
import { Link, Routes } from "blitz";
import { HiCheck, HiX } from "react-icons/hi";
import clsx from "clsx";
import * as Panelbear from "@panelbear/panelbear-js";

import BaseLayout from "../components/base-layout";

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
			price: 0,
			frequency: "",
			description: "The essentials to let you try Shellphone.",
			features: ["SMS (send only)"],
			unavailableFeatures: paidFeatures.slice(1),
			cta: "Join waitlist",
			yearly: false,
		},
		{
			title: "Yearly",
			price: 12.5,
			frequency: "/month",
			description: "Text and call anyone, anywhere in the world, all year long.",
			features: paidFeatures,
			unavailableFeatures: [],
			cta: "Join waitlist",
			yearly: true,
		},
		{
			title: "Monthly",
			price: 15,
			frequency: "/month",
			description: "Text and call anyone, anywhere in the world.",
			features: paidFeatures,
			unavailableFeatures: [],
			cta: "Join waitlist",
			yearly: false,
		},
	],
};

const Pricing: BlitzPage = () => {
	return (
		<section className="pt-32 pb-10 px-4 sm:px-6 md:pt-34 md:pb-16">
			<div className="bg-white">
				<h2 className="text-3xl font-mackinac font-extrabold text-navy sm:text-5xl sm:leading-none sm:tracking-tight">
					Simple no-tricks pricing
				</h2>
				<p className="mt-6 max-w-2xl text-xl text-gray-500">
					One affordable and transparent plan that includes everything you need.
				</p>

				<div className="mt-24 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
					{pricing.tiers.map((tier) => (
						<div
							key={tier.title}
							className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col"
						>
							<div className="flex-1">
								<h3 className="text-2xl font-mackinac font-semibold text-gray-900">{tier.title}</h3>
								{tier.yearly ? (
									<p className="absolute top-0 py-1.5 px-4 bg-primary-500 rounded-full text-xs font-semibold uppercase tracking-wide text-white transform -translate-y-1/2">
										Get 2 months free!
									</p>
								) : null}
								<p className="mt-4 flex items-baseline text-gray-900">
									<span className="text-4xl font-extrabold tracking-tight">{tier.price}€</span>
									<span className="ml-1 text-xl font-semibold">{tier.frequency}</span>
								</p>
								{tier.yearly ? (
									<p className="text-gray-500 text-sm">Billed yearly ({tier.price * 12}€)</p>
								) : null}
								<p className="mt-6 text-gray-500">{tier.description}</p>

								<ul role="list" className="mt-6 space-y-6">
									{tier.features.map((feature) => (
										<li key={feature} className="flex">
											<HiCheck
												className="flex-shrink-0 w-6 h-6 text-[#0eb56f]"
												aria-hidden="true"
											/>
											<span className="ml-3 text-gray-500">{feature}</span>
										</li>
									))}
									{tier.unavailableFeatures.map((feature) => (
										<li key={feature} className="flex">
											<HiX className="flex-shrink-0 w-6 h-6 text-[#d95565]" aria-hidden="true" />
											<span className="ml-3 text-gray-500">
												{~feature.indexOf("(coming soon)")
													? feature.slice(0, feature.indexOf("(coming soon)"))
													: feature}
											</span>
										</li>
									))}
								</ul>
							</div>

							<Link href={Routes.LandingPage({ join_waitlist: "" })}>
								<a
									onClick={() => Panelbear.track("redirect-to-join-waitlist")}
									className={clsx(
										tier.yearly
											? "bg-primary-500 text-white hover:bg-primary-600"
											: "bg-primary-50 text-primary-700 hover:bg-primary-100",
										"mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium",
									)}
								>
									{tier.cta}
								</a>
							</Link>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

Pricing.getLayout = (page) => <BaseLayout>{page}</BaseLayout>;
Pricing.suppressFirstRenderFlicker = true;

export default Pricing;
