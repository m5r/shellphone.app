import type { BlitzPage } from "blitz";
import { Head } from "blitz";
import { XIcon } from "@heroicons/react/outline";

import Header from "../components/header";

import iphoneMockup from "../images/iphone-mockup.png";
import mockupImage from "../images/mockup-image-01.png";
import Checkmark from "../components/checkmark";

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
									{/* Hero content */}
									<div className="md:grid md:grid-cols-12 md:gap-12 lg:gap-20 items-center">
										{/* Content */}
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
											{/* CTA form */}
											<form className="mt-8">
												<div className="flex flex-col sm:flex-row justify-center max-w-sm mx-auto sm:max-w-md md:mx-0">
													<input
														type="email"
														className="form-input w-full mb-2 sm:mb-0 sm:mr-2"
														placeholder="Enter your email address"
													/>
													<a
														className="btn text-white bg-primary-500 hover:bg-primary-400 flex-shrink-0"
														href="#0"
													>
														Request access
													</a>
												</div>
												{/* Success message */}
												{/* <p className="text-center md:text-left mt-2 opacity-75 text-sm">Thanks for subscribing!</p> */}
											</form>
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

										{/* Mobile mockup */}
										<div className="md:col-span-5 lg:col-span-5 text-center md:text-right">
											<div className="inline-flex relative justify-center items-center">
												{/* Glow illustration */}
												<svg
													className="absolute mr-12 mt-32 pointer-events-none -z-1"
													aria-hidden="true"
													width="678"
													height="634"
													viewBox="0 0 678 634"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<circle
														cx="240"
														cy="394"
														r="240"
														fill="url(#piphoneill_paint0_radial)"
														fillOpacity=".4"
													/>
													<circle
														cx="438"
														cy="240"
														r="240"
														fill="url(#piphoneill_paint1_radial)"
														fillOpacity=".6"
													/>
													<defs>
														<radialGradient
															id="piphoneill_paint0_radial"
															cx="0"
															cy="0"
															r="1"
															gradientUnits="userSpaceOnUse"
															gradientTransform="rotate(90 -77 317) scale(189.054)"
														>
															<stop stopColor="#667EEA" />
															<stop offset="1" stopColor="#667EEA" stopOpacity=".01" />
														</radialGradient>
														<radialGradient
															id="piphoneill_paint1_radial"
															cx="0"
															cy="0"
															r="1"
															gradientUnits="userSpaceOnUse"
															gradientTransform="rotate(90 99 339) scale(189.054)"
														>
															<stop stopColor="#9F7AEA" />
															<stop offset="1" stopColor="#9F7AEA" stopOpacity=".01" />
														</radialGradient>
													</defs>
												</svg>
												{/* Image inside mockup size: 290x624px (or 580x1248px for Retina devices) */}
												<img
													className="absolute max-w-[84.33%]"
													src={mockupImage.src}
													width={290}
													height={624}
													alt="Features illustration"
												/>
												{/* iPhone mockup */}
												<img
													className="relative max-w-full mx-auto md:mr-0 md:max-w-none h-auto pointer-events-none"
													src={iphoneMockup.src}
													width={344}
													height={674}
													alt="iPhone mockup"
													aria-hidden="true"
												/>
											</div>
										</div>
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

function ReferralBanner() {
	const isDisabled = true;
	if (isDisabled) {
		return null;
	}

	return (
		<div className="relative bg-primary-600">
			<div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
				<div className="pr-16 sm:text-center sm:px-16">
					<p className="font-medium text-white">
						<span>&#127881; New: Get one month free for every friend that joins and subscribe!</span>
						<span className="block sm:ml-2 sm:inline-block">
							<a href="#" className="text-white font-bold underline">
								{" "}
								Learn more <span aria-hidden="true">&rarr;</span>
							</a>
						</span>
					</p>
				</div>
				<div className="absolute inset-y-0 right-0 pt-1 pr-1 flex items-start sm:pt-1 sm:pr-2 sm:items-start">
					<button
						type="button"
						className="flex p-2 rounded-md hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-white"
					>
						<span className="sr-only">Dismiss</span>
						<XIcon className="h-6 w-6 text-white" aria-hidden="true" />
					</button>
				</div>
			</div>
		</div>
	);
}

LandingPage.suppressFirstRenderFlicker = true;

export default LandingPage;
