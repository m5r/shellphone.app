import { useQuery } from "blitz";

import getCurrentCustomerPhoneNumber from "../../phone-numbers/queries/get-current-customer-phone-number";
import useCurrentCustomer from "./use-current-customer";

export default function useCustomerPhoneNumber() {
	const { customer } = useCurrentCustomer();
	const hasFilledTwilioCredentials = Boolean(customer && customer.accountSid && customer.authToken);
	const [customerPhoneNumber] = useQuery(getCurrentCustomerPhoneNumber, {}, { enabled: hasFilledTwilioCredentials });

	return customerPhoneNumber;
}
