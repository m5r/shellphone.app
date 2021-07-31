import { useQuery } from "blitz";

import useCurrentCustomer from "../../core/hooks/use-current-customer";
import getPhoneCalls from "../queries/get-phone-calls";

export default function usePhoneCalls() {
	const { customer } = useCurrentCustomer();
	if (!customer) {
		throw new Error("customer not found");
	}

	const { phoneCalls } = useQuery(getPhoneCalls, { customerId: customer.id })[0];

	return phoneCalls;
}
