import type { BlitzPage } from "blitz"

import OnboardingLayout from "../../components/onboarding-layout"
import useCurrentCustomer from "../../../core/hooks/use-current-customer"

const StepOne: BlitzPage = () => {
	useCurrentCustomer() // preload for step two

	return (
		<OnboardingLayout
			currentStep={1}
			next={{ href: "/welcome/step-two", label: "Set up your phone number" }}
		>
			<div className="flex flex-col space-y-4 items-center">
				<span>Welcome, let’s set up your virtual phone!</span>
			</div>
		</OnboardingLayout>
	)
}

StepOne.authenticate = true

export default StepOne
