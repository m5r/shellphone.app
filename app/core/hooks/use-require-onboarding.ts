import { Routes, useRouter } from "blitz";

import useCurrentCustomer from "./use-current-customer";
import useCustomerPhoneNumber from "./use-customer-phone-number";

export default function useRequireOnboarding() {
	const router = useRouter();
	const { customer, hasCompletedOnboarding } = useCurrentCustomer();
	const customerPhoneNumber = useCustomerPhoneNumber();

	if (!hasCompletedOnboarding) {
		throw router.push(Routes.StepTwo());
	}

	/*if (!customer.paddleCustomerId || !customer.paddleSubscriptionId) {
		throw router.push(Routes.StepTwo());
		return;
	}*/

	console.log("customerPhoneNumber", customerPhoneNumber);
	if (!customerPhoneNumber) {
		throw router.push(Routes.StepThree());
	}
}
