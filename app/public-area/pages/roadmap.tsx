import type { BlitzPage } from "blitz";
import { Head } from "blitz";
import clsx from "clsx";
import { CheckIcon, XIcon, TerminalIcon } from "@heroicons/react/solid";

import Header from "../components/header";
import Footer from "../components/footer";

const Roadmap: BlitzPage = () => {
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
			<section className="font-inter antialiased bg-white text-gray-900 tracking-tight">
				<section className="flex flex-col min-h-screen overflow-hidden">
					<Header />

					<main className="flex-grow">
						<section className="max-w-6xl mx-auto px-4 sm:px-6">
							<div className="pt-32 pb-10 md:pt-34 md:pb-16">
								<div className="max-w-5xl mx-auto">
									<h1 className="h1 mb-16 font-extrabold font-mackinac">(Rough) Roadmap</h1>
								</div>

								<div className="max-w-3xl mx-auto text-lg xl:text-xl flow-root">
									<ul role="list" className="-mb-8">
										{roadmap.map((feature, index) => {
											const isDone = feature.status === "done";
											const isInProgress = feature.status === "in-progress";
											return (
												<li key={feature.name}>
													<div className="relative pb-8">
														{index !== roadmap.length - 1 ? (
															<span
																className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
																aria-hidden="true"
															/>
														) : null}
														<div className="relative flex space-x-3">
															<div>
																<span
																	className={clsx(
																		isDone
																			? "bg-green-500"
																			: isInProgress
																			? "bg-yellow-500"
																			: "bg-gray-400",
																		"h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white",
																	)}
																>
																	{isDone ? (
																		<CheckIcon
																			className="h-5 w-5 text-white"
																			aria-hidden="true"
																		/>
																	) : isInProgress ? (
																		<TerminalIcon
																			className="h-5 w-5 text-white"
																			aria-hidden="true"
																		/>
																	) : (
																		<XIcon
																			className="h-5 w-5 text-white"
																			aria-hidden="true"
																		/>
																	)}
																</span>
															</div>
															<div className="min-w-0 flex-1 items-center flex justify-between space-x-4">
																<div>
																	<p className="text-md xl:text-lg text-gray-900">
																		{feature.name}
																	</p>
																</div>
																{isDone ? (
																	<div className="text-right self-start text-md xl:text-lg whitespace-nowrap text-gray-500">
																		<time>
																			{formatter.format(feature.doneDate)}
																		</time>
																	</div>
																) : null}
															</div>
														</div>
													</div>
												</li>
											);
										})}
									</ul>
								</div>
							</div>
						</section>
					</main>

					<Footer />
				</section>
			</section>
		</>
	);
};

type RoadmapItem = {
	name: string;
	doneDate?: unknown;
} & (
	| {
			status: "done";
			doneDate: Date;
	  }
	| {
			status: "in-progress";
	  }
	| {
			status: "to-do";
	  }
);

const roadmap: RoadmapItem[] = [
	{
		name: "Send SMS",
		status: "done",
		doneDate: new Date("2021-07-18T15:33:08Z"),
	},
	{
		name: "Receive SMS",
		status: "done",
		doneDate: new Date("2021-08-01T10:54:51Z"),
	},
	{
		name: "Make a phone call",
		status: "in-progress",
	},
	{
		name: "Receive a phone call",
		status: "to-do",
	},
	{
		name: "Get notified of incoming messages and calls",
		status: "to-do",
	},
	{
		name: "Remove any phone call or message from history",
		status: "to-do",
	},
	{
		name: "Allow incoming calls to go to voicemail",
		status: "to-do",
	},
	{
		name: "Forward incoming messages and phone calls to your desired phone number",
		status: "to-do",
	},
	{
		name: "Import contacts from your mobile phone",
		status: "to-do",
	},
	{
		name: "Use Shellphone with multiple phone numbers at once",
		status: "to-do",
	},
	{
		name: "Port your phone number to Shellphone - you won't have to deal with Twilio anymore!",
		status: "to-do",
	},
	{
		name: "Send delayed messages",
		status: "to-do",
	},
	{
		name: "Record phone calls",
		status: "to-do",
	},
];

const formatter = Intl.DateTimeFormat("en-US", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

Roadmap.suppressFirstRenderFlicker = true;

export default Roadmap;
