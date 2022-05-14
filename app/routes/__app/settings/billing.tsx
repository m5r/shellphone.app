import { SubscriptionStatus } from "@prisma/client";

import usePaymentsHistory from "~/features/settings/hooks/use-payments-history";
import SettingsSection from "~/features/settings/components/settings-section";
import BillingHistory from "~/features/settings/components/billing/billing-history";
import Divider from "~/features/settings/components/divider";
import Plans from "~/features/settings/components/billing/plans";
import PaddleLink from "~/features/settings/components/billing/paddle-link";

function useSubscription() {
	return {
		subscription: null as any,
		cancelSubscription: () => void 0,
		updatePaymentMethod: () => void 0,
	};
}

function Billing() {
	const { count: paymentsCount } = usePaymentsHistory();
	const { subscription, cancelSubscription, updatePaymentMethod } = useSubscription();

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
								onClick={() => updatePaymentMethod(/*{ updateUrl: subscription.updateUrl }*/)}
								text="Update payment method"
							/>
							<PaddleLink
								onClick={() => cancelSubscription(/*{ cancelUrl: subscription.cancelUrl }*/)}
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
}

const plansName: Record<number, string> = {
	727544: "Yearly",
	727540: "Monthly",
};

export default Billing;
