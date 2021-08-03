import { useSession, useQuery } from "blitz";

import getCurrentCustomer from "../../customers/queries/get-current-customer";

export default function useCurrentCustomer() {
	const session = useSession();
	const [customer] = useQuery(getCurrentCustomer, null, { enabled: Boolean(session.userId) });
	return {
		customer,
		hasFilledTwilioCredentials: Boolean(customer && customer.accountSid && customer.authToken),
		hasCompletedOnboarding: session.hasCompletedOnboarding,
	};
}
