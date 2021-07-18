import type { FunctionComponent, MouseEventHandler } from "react";
import type { NextPage } from "next";
import { ExternalLinkIcon } from "@heroicons/react/outline";

import SettingsLayout from "../../components/settings/settings-layout";
import SettingsSection from "../../components/settings/settings-section";
import BillingPlans from "../../components/billing/billing-plans";
import Divider from "../../components/divider";

import useSubscription from "../../hooks/use-subscription";

import { withPageOnboardingRequired } from "../../../lib/session-helpers";
import type { Subscription } from "../../database/subscriptions";
import { findUserSubscription } from "../../database/subscriptions";

import appLogger from "../../../lib/logger";

const logger = appLogger.child({ page: "/account/settings/billing" });

type Props = {
	subscription: Subscription | null;
};

const Billing: NextPage<Props> = ({ subscription }) => {
	/*
	TODO: I want to be able to
	   - renew subscription (after pause/cancel for example) (message like "your subscription expired, would you like to renew ?")
	   - know when is the last time I paid and for how much
	   - know when is the next time I will pay and for how much
	 */
	const { cancelSubscription, updatePaymentMethod } = useSubscription();

	return (
		<SettingsLayout>
			<div className="flex flex-col space-y-6 p-6">
				{subscription ? (
					<>
						<SettingsSection title="Payment method">
							<PaddleLink
								onClick={() =>
									updatePaymentMethod({
										updateUrl: subscription.updateUrl,
									})
								}
								text="Update payment method on Paddle"
							/>
						</SettingsSection>

						<div className="hidden lg:block">
							<Divider />
						</div>

						<SettingsSection title="Plan">
							<BillingPlans activePlanId={subscription?.planId} />
						</SettingsSection>

						<div className="hidden lg:block">
							<Divider />
						</div>

						<SettingsSection title="Cancel subscription">
							<PaddleLink
								onClick={() =>
									cancelSubscription({
										cancelUrl: subscription.cancelUrl,
									})
								}
								text="Cancel subscription on Paddle"
							/>
						</SettingsSection>
					</>
				) : (
					<SettingsSection title="Plan">
						<BillingPlans />
					</SettingsSection>
				)}
			</div>
		</SettingsLayout>
	);
};

export default Billing;

type PaddleLinkProps = {
	onClick: MouseEventHandler<HTMLButtonElement>;
	text: string;
};

const PaddleLink: FunctionComponent<PaddleLinkProps> = ({ onClick, text }) => (
	<button className="flex space-x-2 items-center text-left" onClick={onClick}>
		<ExternalLinkIcon className="w-6 h-6 flex-shrink-0" />
		<span className="transition-colors duration-150 border-b border-transparent hover:border-primary-500">
			{text}
		</span>
	</button>
);

export const getServerSideProps = withPageOnboardingRequired<Props>(
	async (context, user) => {
		// const subscription = await findUserSubscription({ userId: user.id });

		return {
			props: { subscription: null },
		};
	},
);
