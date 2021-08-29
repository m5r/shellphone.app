import type { BlitzPage } from "blitz";

import BaseLayout from "../components/base-layout";
import ReferralBanner from "../components/referral-banner";
import Hero from "../components/hero";
import FAQs from "../components/faqs";

const LandingPage: BlitzPage = () => {
	return (
		<>
			<ReferralBanner />
			<Hero />
			<FAQs />
		</>
	);
};

LandingPage.getLayout = (page) => <BaseLayout>{page}</BaseLayout>;
LandingPage.suppressFirstRenderFlicker = true;

export default LandingPage;
