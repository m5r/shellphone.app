import type { FunctionComponent } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import clsx from "clsx";

export default function FAQs() {
	return (
		<section className="max-w-6xl mx-auto px-4 sm:px-6">
			<div className="py-12 md:py-20 border-t border-gray-200">
				<div className="max-w-3xl mx-auto text-center pb-20">
					<h2 className="h2 font-mackinac">Questions & Answers</h2>
				</div>

				<ul className="max-w-3xl mx-auto pl-12">
					<Accordion title="Do I need coding knowledge to use this product?">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
						labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
						laboris nisi ut aliquip ex ea commodo consequat.
					</Accordion>
					<Accordion title="Do you have student or non-profit discounts?">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
						labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
						laboris nisi ut aliquip ex ea commodo consequat.
					</Accordion>
					<Accordion title="Is there a way to become an Affiliate reseller of this product?">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
						labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
						laboris nisi ut aliquip ex ea commodo consequat.
					</Accordion>
					<Accordion title="What is the difference between the Free and Paid versions?">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
						labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
						laboris nisi ut aliquip ex ea commodo consequat.
					</Accordion>
					<Accordion title="How can I change the owner of a workspace?">
						Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
						labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
						laboris nisi ut aliquip ex ea commodo consequat.
					</Accordion>
					<span className="block border-t border-gray-200" aria-hidden="true" />
				</ul>
			</div>
		</section>
	);
}

const Accordion: FunctionComponent<{ title: string }> = ({ title, children }) => {
	return (
		<Disclosure>
			{({ open }) => (
				<>
					<Disclosure.Button className="flex items-center w-full text-lg font-medium text-left py-5 border-t border-gray-200">
						<svg
							className="w-4 h-4 fill-current text-blue-500 flex-shrink-0 mr-8 -ml-12"
							viewBox="0 0 16 16"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect
								y="7"
								width="16"
								height="2"
								rx="1"
								className={clsx("transform origin-center transition duration-200 ease-out", {
									"rotate-180": open,
								})}
							/>
							<rect
								y="7"
								width="16"
								height="2"
								rx="1"
								className={clsx("transform origin-center transition duration-200 ease-out", {
									"rotate-90": !open,
									"rotate-180": open,
								})}
							/>
						</svg>
						<span>{title}</span>
					</Disclosure.Button>

					<Transition
						enter="transition duration-300 ease-in-out"
						enterFrom="transform scale-95 opacity-0"
						enterTo="transform scale-100 opacity-100"
						leave="transition duration-75 ease-out"
						leaveFrom="transform scale-100 opacity-100"
						leaveTo="transform scale-95 opacity-0"
					>
						<Disclosure.Panel className="text-gray-600 overflow-hidden">
							<p className="pb-5">{children}</p>
						</Disclosure.Panel>
					</Transition>
				</>
			)}
		</Disclosure>
	);
};
