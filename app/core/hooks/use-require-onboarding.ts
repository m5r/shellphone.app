import { Routes, useRouter } from "blitz";

import useCurrentCustomer from "./use-current-customer";
import useCustomerPhoneNumber from "./use-customer-phone-number";

export default function useRequireOnboarding() {
	const router = useRouter();
	const { hasFilledTwilioCredentials, hasCompletedOnboarding } = useCurrentCustomer();
	const customerPhoneNumber = useCustomerPhoneNumber();

	if (hasCompletedOnboarding) {
		return;
	}

	if (!hasFilledTwilioCredentials) {
		throw router.push(Routes.StepTwo());
	}

	/*if (!customer.paddleCustomerId || !customer.paddleSubscriptionId) {
		throw router.push(Routes.StepTwo());
		return;
	}*/

	if (!customerPhoneNumber) {
		throw router.push(Routes.StepThree());
	}
}
