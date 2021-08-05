import { Routes, useRouter } from "blitz";

import useCurrentUser from "./use-current-user";
import useCurrentPhoneNumber from "./use-current-phone-number";

export default function useRequireOnboarding() {
	const router = useRouter();
	const { hasFilledTwilioCredentials, hasCompletedOnboarding } = useCurrentUser();
	const phoneNumber = useCurrentPhoneNumber();

	if (hasCompletedOnboarding) {
		return;
	}

	if (!hasFilledTwilioCredentials) {
		throw router.push(Routes.StepTwo());
	}

	/*if (!user.paddleCustomerId || !user.paddleSubscriptionId) {
		throw router.push(Routes.StepTwo());
		return;
	}*/

	if (!phoneNumber) {
		throw router.push(Routes.StepThree());
	}
}
