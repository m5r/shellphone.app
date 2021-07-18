import type { NextPage } from "next";

import { withPageAuthRequired } from "../../../lib/session-helpers";

import OnboardingLayout from "../../components/welcome/onboarding-layout";

const StepOne: NextPage = () => {
	return (
		<OnboardingLayout
			currentStep={1}
			next={{ href: "/welcome/step-two", label: "Set up your phone number" }}
		>
			<div className="flex flex-col space-y-4 items-center">
				<span>Welcome, let’s set up your virtual phone!</span>
			</div>
		</OnboardingLayout>
	);
};

export const getServerSideProps = withPageAuthRequired();

export default StepOne;
