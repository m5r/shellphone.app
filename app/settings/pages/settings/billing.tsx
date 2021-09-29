import type { BlitzPage } from "blitz";
import { GetServerSideProps, Routes } from "blitz";

import useSubscription from "../../hooks/use-subscription";
import useRequireOnboarding from "../../../core/hooks/use-require-onboarding";
import SettingsLayout from "../../components/settings-layout";
import appLogger from "../../../../integrations/logger";
import PaddleLink from "../../components/paddle-link";
import SettingsSection from "../../components/settings-section";
import Divider from "../../components/divider";

const logger = appLogger.child({ page: "/account/settings/billing" });

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
		return <SettingsSection title="Plan">{/*<BillingPlans />*/}</SettingsSection>;
	}

	return (
		<>
			<SettingsSection title="Payment method">
				<PaddleLink
					onClick={() => updatePaymentMethod({ updateUrl: subscription.updateUrl })}
					text="Update payment method on Paddle"
				/>
			</SettingsSection>

			<div className="hidden lg:block">
				<Divider />
			</div>

			<SettingsSection title="Plan">
				{/*<BillingPlans activePlanId={subscription.paddlePlanId} />*/}
			</SettingsSection>

			<div className="hidden lg:block">
				<Divider />
			</div>

			<SettingsSection title="Cancel subscription">
				<PaddleLink
					onClick={() => cancelSubscription({ cancelUrl: subscription.cancelUrl })}
					text="Cancel subscription on Paddle"
				/>
			</SettingsSection>
		</>
	);
};

Billing.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

Billing.authenticate = { redirectTo: Routes.SignIn() };

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	return { props: {} };
};

export default Billing;
