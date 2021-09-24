import type { FunctionComponent } from "react";

import BaseLayout from "./base-layout";

type Props = {
	title?: string;
};

const Layout: FunctionComponent<Props> = ({ children, title }) => (
	<BaseLayout>
		<section className="max-w-6xl mx-auto px-4 sm:px-6">
			<div className="pt-32 pb-10 md:pt-34 md:pb-16">
				{title ? (
					<div className="max-w-5xl mx-auto">
						<h1 className="h1 mb-16 text-navy font-extrabold font-mackinac">{title}</h1>
					</div>
				) : null}

				<div className="max-w-3xl mx-auto text-lg xl:text-xl flow-root">{children}</div>
			</div>
		</section>
	</BaseLayout>
);

export default Layout;
