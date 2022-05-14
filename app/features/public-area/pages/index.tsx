import Header from "../components/header";
import Footer from "../components/footer";
import ReferralBanner from "../components/referral-banner";
import Hero from "../components/hero";
import FAQs from "../components/faqs";

export default function IndexPage() {
	return (
		<section className="font-inter antialiased bg-white text-gray-900 tracking-tight">
			<section className="flex flex-col min-h-screen overflow-hidden">
				<Header />

				<main className="flex-grow">
					<ReferralBanner />
					<Hero />
					<FAQs />
				</main>

				<Footer />
			</section>
		</section>
	);
}
