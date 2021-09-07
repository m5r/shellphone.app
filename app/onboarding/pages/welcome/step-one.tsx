import type { BlitzPage, GetServerSideProps } from "blitz";
import { getSession, Routes } from "blitz";

import OnboardingLayout from "../../components/onboarding-layout";
import useCurrentUser from "../../../core/hooks/use-current-user";
import db from "../../../../db";

const StepOne: BlitzPage = () => {
	useCurrentUser(); // preload for step two

	return (
		<div className="flex flex-col space-y-4 items-center">
			<h2>Welcome to Shellphone</h2>
			<span className="text-center">
				We&#39;ll help you connect your Twilio phone number to our service and set up your virtual phone!
			</span>
		</div>
	);
};

StepOne.getLayout = (page) => (
	<OnboardingLayout currentStep={1} next={{ href: Routes.StepTwo().pathname, label: "Connect Twilio to Shellphone" }}>
		{page}
	</OnboardingLayout>
);

StepOne.authenticate = { redirectTo: Routes.SignIn() };

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	const session = await getSession(req, res);
	if (!session.userId) {
		await session.$revoke();
		return {
			redirect: {
				destination: Routes.LandingPage().pathname,
				permanent: false,
			},
		};
	}

	const phoneNumber = await db.phoneNumber.findFirst({ where: { organizationId: session.orgId } });
	if (phoneNumber) {
		await session.$setPublicData({ hasCompletedOnboarding: true });
		return {
			redirect: {
				destination: Routes.Messages().pathname,
				permanent: false,
			},
		};
	}

	return { props: {} };
};

export default StepOne;
