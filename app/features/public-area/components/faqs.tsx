import type { FunctionComponent, PropsWithChildren } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import clsx from "clsx";

import Container from "./container";
import backgroundImage from "../images/background-faqs.jpg";

const faqs = [
	[
		{
			question: "Does TaxPal handle VAT?",
			answer: "Well no, but if you move your company offshore you can probably ignore it.",
		},
		{
			question: "Can I pay for my subscription via purchase order?",
			answer: "Absolutely, we are happy to take your money in all forms.",
		},
		{
			question: "How do I apply for a job at TaxPal?",
			answer: "We only hire our customers, so subscribe for a minimum of 6 months and then let’s talk.",
		},
	],
	[
		{
			question: "What was that testimonial about tax fraud all about?",
			answer: "TaxPal is just a software application, ultimately your books are your responsibility.",
		},
		{
			question: "TaxPal sounds horrible but why do I still feel compelled to purchase?",
			answer: "This is the power of excellent visual design. You just can’t resist it, no matter how poorly it actually functions.",
		},
		{
			question: "I found other companies called TaxPal, are you sure you can use this name?",
			answer: "Honestly not sure at all. We haven’t actually incorporated or anything, we just thought it sounded cool and made this website.",
		},
	],
	[
		{
			question: "How do you generate reports?",
			answer: "You just tell us what data you need a report for, and we get our kids to create beautiful charts for you using only the finest crayons.",
		},
		{
			question: "Can we expect more inventory features?",
			answer: "In life it’s really better to never expect anything at all.",
		},
		{
			question: "I lost my password, how do I get into my account?",
			answer: "Send us an email and we will send you a copy of our latest password spreadsheet so you can find your information.",
		},
	],
];

export default function Faqs() {
	return (
		<section id="faq" aria-labelledby="faq-title" className="relative overflow-hidden bg-slate-50 py-20 sm:py-32">
			<img
				className="absolute top-0 left-1/2 max-w-none translate-x-[-30%] -translate-y-1/4"
				src={backgroundImage}
				alt=""
				width={1558}
				height={946}
			/>
			<Container className="relative">
				<div className="mx-auto max-w-2xl lg:mx-0">
					<h2
						id="faq-title"
						className="font-mackinac font-bold text-3xl tracking-tight text-slate-900 sm:text-4xl"
					>
						Frequently asked questions
					</h2>
				</div>
				<ul className="mt-16 grid grid-cols-1 max-w-3xl mx-auto pl-12 lg:mx-0">
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
			</Container>
		</section>
	);
}

function FAQs() {
	return (
		<section className="max-w-6xl mx-auto px-4 sm:px-6">
			<div className="py-12 md:py-20">
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

const Accordion: FunctionComponent<PropsWithChildren<{ title: string }>> = ({ title, children }) => {
	return (
		<Disclosure>
			{({ open }) => (
				<>
					<Disclosure.Button className="flex items-center w-full text-lg font-medium text-left py-5 border-t border-gray-200">
						<svg
							className="w-4 h-4 fill-current text-rebeccapurple-500 flex-shrink-0 mr-8 -ml-12"
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
