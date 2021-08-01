import { useAuthenticatedSession, useQuery } from "blitz";

import getCurrentCustomer from "../../customers/queries/get-current-customer";

export default function useCurrentCustomer() {
	const session = useAuthenticatedSession();
	const [customer] = useQuery(getCurrentCustomer, null);
	return {
		customer,
		hasFilledTwilioCredentials: Boolean(customer && customer.accountSid && customer.authToken),
		hasCompletedOnboarding: session.hasCompletedOnboarding,
	};
}
