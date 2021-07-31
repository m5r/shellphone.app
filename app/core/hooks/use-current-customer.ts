import { useQuery } from "blitz"

import getCurrentCustomer from "../../customers/queries/get-current-customer"

export default function useCurrentCustomer() {
	const [customer] = useQuery(getCurrentCustomer, null)
	return {
		customer,
		hasCompletedOnboarding: Boolean(!!customer && customer.accountSid && customer.authToken),
	}
}
