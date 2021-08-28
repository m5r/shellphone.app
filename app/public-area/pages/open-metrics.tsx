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
						<section>
							<div className="max-w-6xl mx-auto px-4 sm:px-6">
								<div className="pt-32 pb-10 md:pt-34 md:pb-16">Open Metrics</div>
							</div>
						</section>
					</main>
				</section>
			</section>
		</>
	);
};

OpenMetrics.suppressFirstRenderFlicker = true;

export default OpenMetrics;
