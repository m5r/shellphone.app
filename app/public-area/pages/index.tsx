import type { BlitzPage } from "blitz";
import { Head } from "blitz";

import Header from "../components/header";
import ReferralBanner from "../components/referral-banner";
import Hero from "../components/hero";
import FAQs from "../components/faqs";
import Footer from "../components/footer";

const LandingPage: BlitzPage = () => {
	return (
		<>
			<Head>
				<title>Shellphone: Your Personal Cloud Phone</title>
				<link
					rel="preload"
					href="/fonts/P22MackinacPro-ExtraBold.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
			</Head>
			<ReferralBanner />
			<section className="font-inter antialiased bg-white text-gray-900 tracking-tight">
				<section className="flex flex-col min-h-screen overflow-hidden">
					<Header />

					<main className="flex-grow">
						<Hero />
						<FAQs />
					</main>

					<Footer />
				</section>
			</section>
		</>
	);
};

LandingPage.suppressFirstRenderFlicker = true;

export default LandingPage;
