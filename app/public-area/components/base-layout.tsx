import type { FunctionComponent } from "react";
import { Head } from "blitz";

import Header from "./header";
import Footer from "./footer";

const BaseLayout: FunctionComponent = ({ children }) => (
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

				<main className="flex-grow">{children}</main>

				<Footer />
			</section>
		</section>
	</>
);

export default BaseLayout;
