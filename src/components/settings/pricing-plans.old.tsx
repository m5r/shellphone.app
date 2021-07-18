import type { FunctionComponent } from "react";
import { useState } from "react";
import clsx from "clsx";
import { CheckIcon } from "@heroicons/react/outline";

import useUser from "../../hooks/use-user";
import useSubscription from "../../hooks/use-subscription";

import type { Plan, PlanId } from "../../subscription/plans";
import {
	FREE,
	MONTHLY,
	ANNUALLY,
	TEAM_MONTHLY,
	TEAM_ANNUALLY,
} from "../../subscription/plans";

type Props = {
	activePlanId?: PlanId;
};
const PLANS: Record<BillingSchedule, Plan[]> = {
	monthly: [FREE, MONTHLY, TEAM_MONTHLY],
	yearly: [FREE, ANNUALLY, TEAM_ANNUALLY],
};

const PricingPlans: FunctionComponent<Props> = ({ activePlanId }) => {
	const [billingSchedule, setBillingSchedule] = useState<BillingSchedule>(
		"monthly",
	);

	return (
		<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
			<div className="sm:flex sm:flex-col sm:align-center">
				<div className="relative self-center mt-6 bg-gray-100 rounded-lg p-0.5 flex sm:mt-8">
					<button
						onClick={() => setBillingSchedule("monthly")}
						type="button"
						className={clsx(
							"relative w-1/2 border-gray-200 rounded-md shadow-sm py-2 text-sm font-medium text-gray-700 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10 sm:w-auto sm:px-8",
							{
								"bg-white": billingSchedule === "monthly",
							},
						)}
					>
						Monthly billing
					</button>
					<button
						onClick={() => setBillingSchedule("yearly")}
						type="button"
						className={clsx(
							"ml-0.5 relative w-1/2 border border-transparent rounded-md py-2 text-sm font-medium text-gray-700 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10 sm:w-auto sm:px-8",
							{
								"bg-white": billingSchedule === "yearly",
							},
						)}
					>
						Yearly billing
					</button>
				</div>
			</div>

			<div className="mt-6 space-y-4 flex flex-row flex-wrap sm:mt-10 sm:space-y-0 sm:gap-6 lg:max-w-4xl lg:mx-auto">
				{PLANS[billingSchedule].map((plan) => (
					<PricingPlan
						key={`pricing-plan-${plan.name}`}
						plan={plan}
						billingSchedule={billingSchedule}
						activePlanId={activePlanId}
					/>
				))}
			</div>
		</div>
	);
};

export default PricingPlans;

type BillingSchedule = "yearly" | "monthly";

type PricingPlanProps = {
	plan: Plan;
	billingSchedule: BillingSchedule;
	activePlanId?: PlanId;
};

const PricingPlan: FunctionComponent<PricingPlanProps> = ({
	plan,
	billingSchedule,
	activePlanId,
}) => {
	const { subscribe, changePlan } = useSubscription();
	const { userProfile } = useUser();
	const { name, description, features, price, id } = plan;
	const isActivePlan =
		(typeof activePlanId !== "undefined" ? activePlanId : "free") === id;

	function movePlan() {
		const teamId = userProfile!.teamId;
		const email = userProfile!.email;
		const planId = plan.id;

		if (typeof activePlanId === "undefined" && typeof planId === "number") {
			return subscribe({ email, teamId, planId });
		}

		changePlan({ planId });
	}

	return (
		<div
			className={clsx(
				"bg-white w-full flex-grow border rounded-lg shadow-sm divide-y divide-gray-200 sm:w-auto",
				{
					"border-gray-200": !isActivePlan,
					"border-primary-600": isActivePlan,
				},
			)}
		>
			<div className="p-6">
				<h2 className="text-lg leading-6 font-medium text-gray-900">
					{name}
				</h2>
				<p className="mt-4 text-sm text-gray-500">{description}</p>
				<p className="mt-8">
					<PlanPrice
						price={price}
						billingSchedule={billingSchedule}
					/>
				</p>

				<div className="mt-8">
					<PlanButton
						name={name}
						isActivePlan={isActivePlan}
						changePlan={movePlan}
					/>
				</div>
			</div>
			<div className="pt-6 pb-8 px-6">
				<h3 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
					What&apos;s included
				</h3>
				<ul className="mt-6 space-y-4">
					{features.map((feature) => (
						<li
							key={`pricing-plan-${name}-feature-${feature}`}
							className="flex space-x-3"
						>
							<CheckIcon className="flex-shrink-0 h-5 w-5 text-green-500" />
							<span className="text-sm text-gray-500">
								{feature}
							</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

type PlanButtonProps = {
	name: Plan["name"];
	isActivePlan: boolean;
	changePlan: () => void;
};

const PlanButton: FunctionComponent<PlanButtonProps> = ({
	name,
	isActivePlan,
	changePlan,
}) => {
	return isActivePlan ? (
		<div className="block w-full py-2 text-sm font-semibold text-gray-500 text-center">
			You&apos;re currently on this plan
		</div>
	) : (
		<button
			type="button"
			onClick={changePlan}
			className="block w-full cursor-pointer bg-primary-600 border border-primary-600 rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-primary-700"
		>
			Move to <span className="font-bold">{name}</span> plan
		</button>
	);
};

type PlanPriceProps = {
	price: Plan["price"];
	billingSchedule: BillingSchedule;
};

const PlanPrice: FunctionComponent<PlanPriceProps> = ({
	price,
	billingSchedule,
}) => {
	if (price === "free") {
		return (
			<span className="text-4xl font-extrabold text-gray-900">Free</span>
		);
	}

	return (
		<>
			<span className="text-4xl font-extrabold text-gray-900">
				${price}
			</span>
			<span className="text-base font-medium text-gray-500">/mo</span>
			{billingSchedule === "yearly" ? (
				<span className="ml-1 text-sm text-gray-500">
					billed yearly
				</span>
			) : null}
		</>
	);
};
