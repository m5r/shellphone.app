import type { FunctionComponent, PropsWithChildren } from "react";

import Header from "./header";
import Footer from "./footer";

const BaseLayout: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => (
	<>
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
