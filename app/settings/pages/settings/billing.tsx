import type { BlitzPage } from "blitz";
import type { GetServerSideProps } from "blitz";
import { getSession } from "blitz";

import db, { Subscription, SubscriptionStatus } from "db";
import useSubscription from "app/core/hooks/use-subscription";
import usePaymentsHistory from "../../hooks/use-payments-history";
import SettingsLayout from "../../components/settings-layout";
import SettingsSection from "../../components/settings-section";
import Divider from "../../components/divider";
import PaddleLink from "../../components/billing/paddle-link";
import Plans from "../../components/billing/plans";
import BillingHistory from "../../components/billing/billing-history";
import appLogger from "integrations/logger";

const logger = appLogger.child({ page: "/account/settings/billing" });

type Props = {
	subscription?: Subscription;
};

const Billing: BlitzPage<Props> = (props) => {
	const { count: paymentsCount } = usePaymentsHistory();
	const { subscription, cancelSubscription, updatePaymentMethod } = useSubscription({
		initialData: props.subscription,
	});

	return (
		<>
			{subscription ? (
				<SettingsSection>
					{subscription.status === SubscriptionStatus.deleted ? (
						<p>
							Your {plansName[subscription.paddlePlanId]?.toLowerCase()} subscription is cancelled and
							will expire on {subscription.cancellationEffectiveDate!.toLocaleDateString()}.
						</p>
					) : (
						<>
							<p>Current plan: {subscription.paddlePlanId}</p>
							<PaddleLink
								onClick={() => updatePaymentMethod({ updateUrl: subscription.updateUrl })}
								text="Update payment method"
							/>
							<PaddleLink
								onClick={() => cancelSubscription({ cancelUrl: subscription.cancelUrl })}
								text="Cancel subscription"
							/>
						</>
					)}
				</SettingsSection>
			) : null}

			{paymentsCount > 0 ? (
				<>
					<BillingHistory />

					<div className="hidden lg:block lg:py-3">
						<Divider />
					</div>
				</>
			) : null}

			<Plans />
			<p className="text-sm text-gray-500">Prices include all applicable sales taxes.</p>
		</>
	);
};

const plansName: Record<number, string> = {
	727544: "Yearly",
	727540: "Monthly",
};

Billing.getLayout = (page) => <SettingsLayout>{page}</SettingsLayout>;

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
	const session = await getSession(req, res);
	const subscription = await db.subscription.findFirst({
		where: {
			organizationId: session.orgId,
			status: { not: SubscriptionStatus.deleted },
		},
	});
	if (!subscription) {
		return { props: {} };
	}

	return {
		props: { subscription },
	};
};

export default Billing;
