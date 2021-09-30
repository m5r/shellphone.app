import type { BlitzPage } from "blitz";
import { GetServerSideProps, Link, Routes } from "blitz";
import * as Panelbear from "@panelbear/panelbear-js";
import clsx from "clsx";

import useSubscription from "../../hooks/use-subscription";
import useRequireOnboarding from "../../../core/hooks/use-require-onboarding";
import SettingsLayout from "../../components/settings-layout";
import appLogger from "../../../../integrations/logger";
import PaddleLink from "../../components/paddle-link";
import SettingsSection from "../../components/settings-section";
import { HiCheck } from "react-icons/hi";

const logger = appLogger.child({ page: "/account/settings/billing" });

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
			cta: "Current tier",
			yearly: false,
		},
		{
			title: "Monthly",
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

const Billing: BlitzPage = () => {
	/*
	TODO: I want to be able to
		- subscribe
		- cancel my sub
		- upgrade to yearly
		- downgrade to monthly
		- resubscribe (after pause/cancel for example) (message like "your subscription expired, would you like to renew ?")
		- know when is the next time I will pay and for how much
		- have access to my past invoices
	*/

	useRequireOnboarding();
	const { subscription, cancelSubscription, updatePaymentMethod } = useSubscription();
	console.log("subscription", subscription);

	if (!subscription) {
		return (
			<SettingsSection>
				<div>
					<h2 className="text-lg leading-6 font-medium text-gray-900">Subscribe</h2>
					<p className="mt-1 text-sm text-gray-500">
						Update your billing information. Please note that updating your location could affect your tax
						rates.
					</p>
				</div>

				<div className="mt-6 flex flex-row-reverse flex-wrap-reverse gap-x-4">
					{pricing.tiers.map((tier) => (
						<div
							key={tier.title}
							className="relative p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-grow w-1/3 flex-col"
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
											<HiCheck
												className="flex-shrink-0 w-6 h-6 text-[#0eb56f]"
												aria-hidden="true"
											/>
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
			</SettingsSection>
		);
	}

	return (
		<>
			<SettingsSection>
				<PaddleLink
					onClick={() => updatePaymentMethod({ updateUrl: subscription.updateUrl })}
					text="Update payment method on Paddle"
				/>
			</SettingsSection>

			<SettingsSection>{/*<BillingPlans activePlanId={subscription.paddlePlanId} />*/}</SettingsSection>

			<SettingsSection>
				<PaddleLink
					onClick={() => cancelSubscription({ cancelUrl: subscription.cancelUrl })}
					text="Cancel subscription on Paddle"
				/>
			</SettingsSection>

			<section aria-labelledby="billing-history-heading">
				<div className="bg-white pt-6 shadow sm:rounded-md sm:overflow-hidden">
					<div className="px-4 sm:px-6">
						<h2 id="billing-history-heading" className="text-lg leading-6 font-medium text-gray-900">
							Billing history
						</h2>
					</div>
					<div className="mt-6 flex flex-col">
						<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
							<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
								<div className="overflow-hidden border-t border-gray-200">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th
													scope="col"
													className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													Date
												</th>
												<th
													scope="col"
													className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													Description
												</th>
												<th
													scope="col"
													className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													Amount
												</th>
												{/*
                                `relative` is added here due to a weird bug in Safari that causes `sr-only` headings to introduce overflow on the body on mobile.
                              */}
												<th
													scope="col"
													className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													<span className="sr-only">View receipt</span>
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{[
												{
													id: 1,
													date: new Date(),
													description: "",
													amount: "340 USD",
													href: "",
												},
											].map((payment) => (
												<tr key={payment.id}>
													<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
														<time>{payment.date}</time>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{payment.description}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{payment.amount}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
														<a
															href={payment.href}
															className="text-primary-600 hover:text-primary-900"
														>
															View receipt
														</a>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

Billing.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

Billing.authenticate = { redirectTo: Routes.SignIn() };

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return { props: {} };
};

export default Billing;
