import type { BlitzPage, GetServerSideProps } from "blitz";
import { getSession, Routes } from "blitz";

import OnboardingLayout from "../../components/onboarding-layout";
import useCurrentCustomer from "../../../core/hooks/use-current-customer";
import db from "../../../../db";

const StepOne: BlitzPage = () => {
	useCurrentCustomer(); // preload for step two

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

StepOne.authenticate = true;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	const session = await getSession(req, res);
	if (!session.userId) {
		await session.$revoke();
		return {
			redirect: {
				destination: Routes.Home().pathname,
				permanent: false,
			},
		};
	}

	const phoneNumber = await db.phoneNumber.findFirst({ where: { customerId: session.userId } });
	if (!phoneNumber) {
		return { props: {} };
	}

	return {
		redirect: {
			destination: Routes.Messages().pathname,
			permanent: false,
		},
	};
};

export default StepOne;
