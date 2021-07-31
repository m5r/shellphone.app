import type { FunctionComponent } from "react";
import { CheckIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import { Link, Routes, useRouter } from "blitz";

import useCustomerPhoneNumber from "../../core/hooks/use-customer-phone-number";

type StepLink = {
	href: string;
	label: string;
};

type Props = {
	currentStep: 1 | 2 | 3;
	previous?: StepLink;
	next?: StepLink;
};

const steps = ["Welcome", "Twilio Credentials", "Pick a plan"] as const;

const OnboardingLayout: FunctionComponent<Props> = ({ children, currentStep, previous, next }) => {
	const router = useRouter();
	const customerPhoneNumber = useCustomerPhoneNumber();

	if (customerPhoneNumber) {
		throw router.push(Routes.Messages());
	}

	return (
		<div className="bg-gray-800 fixed z-10 inset-0 overflow-y-auto">
			<div className="min-h-screen text-center block p-0">
				{/* This element is to trick the browser into centering the modal contents. */}
				<span className="inline-block align-middle h-screen">&#8203;</span>
				<div className="inline-flex flex-col bg-white rounded-lg text-left overflow-hidden shadow transform transition-all my-8 align-middle max-w-2xl w-[90%] pb-6">
					<h3 className="text-lg leading-6 font-medium text-gray-900 px-6 py-5 border-b border-gray-100">
						{steps[currentStep - 1]}
					</h3>

					<section className="px-6 pt-6 pb-12">{children}</section>

					<nav className="grid grid-cols-1 gap-y-3 mx-auto">
						{next ? (
							<Link href={next.href}>
								<a className="max-w-[240px] mx-auto w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm">
									{next.label}
								</a>
							</Link>
						) : null}

						{previous ? (
							<Link href={previous.href}>
								<a className="max-w-[240px] mx-auto w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm">
									{previous.label}
								</a>
							</Link>
						) : null}

						<ol className="flex items-center">
							{steps.map((step, stepIdx) => {
								const isComplete = currentStep > stepIdx + 1;
								const isCurrent = stepIdx + 1 === currentStep;

								return (
									<li
										key={step}
										className={clsx(
											stepIdx !== steps.length - 1 ? "pr-20 sm:pr-32" : "",
											"relative"
										)}
									>
										{isComplete ? (
											<>
												<div className="absolute inset-0 flex items-center">
													<div className="h-0.5 w-full bg-primary-600" />
												</div>
												<a className="relative w-8 h-8 flex items-center justify-center bg-primary-600 rounded-full">
													<CheckIcon className="w-5 h-5 text-white" />
													<span className="sr-only">{step}</span>
												</a>
											</>
										) : isCurrent ? (
											<>
												<div className="absolute inset-0 flex items-center">
													<div className="h-0.5 w-full bg-gray-200" />
												</div>
												<a className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-primary-600 rounded-full">
													<span className="h-2.5 w-2.5 bg-primary-600 rounded-full" />
													<span className="sr-only">{step}</span>
												</a>
											</>
										) : (
											<>
												<div className="absolute inset-0 flex items-center">
													<div className="h-0.5 w-full bg-gray-200" />
												</div>
												<a className="group relative w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full">
													<span className="h-2.5 w-2.5 bg-transparent rounded-full" />
													<span className="sr-only">{step}</span>
												</a>
											</>
										)}
									</li>
								);
							})}
						</ol>
					</nav>
				</div>
			</div>
		</div>
	);
};

export default OnboardingLayout;
