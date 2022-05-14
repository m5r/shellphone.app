import CTAForm from "./cta-form";

import mockupImage from "../images/phone-mockup.png";

export default function Hero() {
	return (
		<div className="relative bg-gradient-to-b from-rebeccapurple-100 to-rebeccapurple-200">
			<section className="overflow-hidden">
				<div className="flex flex-col lg:flex-row lg:items-stretch lg:min-h-screen lg:max-h-[900px]">
					<div className="flex items-center justify-center w-full lg:order-2 lg:w-7/12">
						<div className="h-full px-4 pt-24 pb-16 sm:px-6 lg:px-24 2xl:px-32 lg:pt-40 lg:pb-14">
							<div className="flex flex-col flex-1 justify-center h-full space-y-8">
								<h1 className="font-heading text-4xl leading-none lg:leading-tight xl:text-5xl xl:leading-tight">
									<span className="bg-gradient-to-br from-rebeccapurple-500 to-indigo-600 bg-clip-text decoration-clone text-transparent">
										Take your phone number
									</span>{" "}
									<span className="text-[#24185B]">anywhere you go</span>
								</h1>

								<p className="text-base lg:text-lg xl:text-xl text-black">
									Coming soon! &#128026; Keep your phone number and pay less for your communications,
									even abroad.
								</p>

								<CTAForm />

								<div className="max-w-lg mx-auto md:mx-0">
									<span className="block md:inline mx-2">
										<em>✓ </em>Free trial
									</span>
									<span className="block md:inline mx-2">
										<em>✓ </em>No credit card required
									</span>
									<span className="block md:inline mx-2">
										<em>✓ </em>Cancel anytime
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="relative w-full overflow-hidden lg:w-5/12 lg:order-1">
						<div className="lg:absolute lg:bottom-0 lg:left-0">
							<img className="w-full" src={mockupImage} alt="App screenshot on a phone" />
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
