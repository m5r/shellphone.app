import type { BlitzPage } from "blitz";
import { Head } from "blitz";

import Header from "../components/header";
import Checkmark from "../components/checkmark";
import CTAForm from "../components/cta-form";
import PhoneMockup from "../components/phone-mockup";
import ReferralBanner from "../components/referral-banner";

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
						<section>
							<div className="max-w-6xl mx-auto px-4 sm:px-6">
								<div className="pt-32 pb-10 md:pt-34 md:pb-16">
									<div className="md:grid md:grid-cols-12 md:gap-12 lg:gap-20 items-center">
										<div className="md:col-span-7 lg:col-span-7 mb-8 md:mb-0 text-center md:text-left">
											<h1 className="h1 lg:text-5xl mb-4 font-extrabold font-mackinac">
												<strong className="bg-gradient-to-br from-primary-500 to-indigo-600 bg-clip-text decoration-clone text-transparent">
													Take your phone number
												</strong>
												<br />
												<strong className="text-[#24185B]">anywhere you go</strong>
											</h1>
											<p className="text-xl text-gray-600">
												Coming soon! &#128026; Keep your phone number and pay less for your
												communications, even abroad.
											</p>
											<CTAForm />
											<ul className="max-w-sm sm:max-w-md mx-auto md:max-w-none text-gray-600 mt-8 -mb-2">
												<li className="flex items-center mb-2">
													<Checkmark />
													<span>Send and receive SMS messages.</span>
												</li>
												<li className="flex items-center mb-2">
													<Checkmark />
													<span>Make and receive phone calls.</span>
												</li>
												<li className="flex items-center mb-2">
													<Checkmark />
													<span>No download required.</span>
												</li>
											</ul>
										</div>

										<PhoneMockup />
									</div>
								</div>
							</div>
						</section>
					</main>
				</section>
			</section>
		</>
	);
};

LandingPage.suppressFirstRenderFlicker = true;

export default LandingPage;
