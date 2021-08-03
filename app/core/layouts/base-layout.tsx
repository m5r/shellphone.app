import { ReactNode } from "react";
import { Head } from "blitz";

type LayoutProps = {
	title?: string;
	children: ReactNode;
};

const BaseLayout = ({ title, children }: LayoutProps) => {
	return (
		<>
			<Head>
				<title>{title || "shellphone.app"}</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			{children}
		</>
	);
};

export default BaseLayout;
