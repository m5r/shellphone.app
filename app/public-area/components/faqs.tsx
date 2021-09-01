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
					<Accordion title="How does it work?">
						Shellphone is your go-to app to use your phone number over the internet. It integrates
						seamlessly with Twilio to provide the best experience for your personal cloud phone.
					</Accordion>
					<Accordion title="What do I need to use Shellphone?">
						Shellphone is still in its early stages and we&#39;re working hard to make it as easy-to-use as
						possible. Currently, you must have a Twilio account to set up your personal cloud phone with
						Shellphone.
					</Accordion>
					<Accordion title="Why would I use this over an eSIM?">
						Chances are you&#39;re currently using an eSIM-compatible device. eSIMs are a reasonable way of
						using a phone number internationally but they are still subject to some irky limitations. For
						example, you can only use an eSIM on one device at a time and you are still subject to
						exorbitant rates from your carrier.
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
							className="w-4 h-4 fill-current text-primary-500 flex-shrink-0 mr-8 -ml-12"
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
