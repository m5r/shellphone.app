import type { BlitzPage } from "blitz";
import { Head } from "blitz";

import Header from "../components/header";

const OpenMetrics: BlitzPage = () => {
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
									<h1 className="h1 mb-16 font-extrabold font-mackinac">Open Metrics</h1>
								</div>

								<div className="max-w-3xl mx-auto text-lg xl:text-xl flow-root">
									<dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
										<Card title="Phone Numbers Registered" value={41} />
										<Card title="SMS Exchanged" value={4929} />
										<Card title="Minutes on Call" value={1612} />
									</dl>
								</div>
							</div>
						</section>
					</main>
				</section>
			</section>
		</>
	);
};

function Card({ title, value }: any) {
	return (
		<div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
			<dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
			<dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
		</div>
	);
}

OpenMetrics.suppressFirstRenderFlicker = true;

export default OpenMetrics;
