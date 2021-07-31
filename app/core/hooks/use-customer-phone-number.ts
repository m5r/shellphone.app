import { useQuery } from "blitz";

import getCurrentCustomerPhoneNumber from "../../phone-numbers/queries/get-current-customer-phone-number";
import useCurrentCustomer from "./use-current-customer";

export default function useCustomerPhoneNumber() {
	const { hasCompletedOnboarding } = useCurrentCustomer();
	const [customerPhoneNumber] = useQuery(
		getCurrentCustomerPhoneNumber,
		{},
		{ enabled: hasCompletedOnboarding }
	);

	return customerPhoneNumber;
}
