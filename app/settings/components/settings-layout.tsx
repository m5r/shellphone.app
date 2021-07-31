import type { FunctionComponent } from "react";
import { useRouter } from "blitz";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/pro-regular-svg-icons";

import Layout from "../../core/layouts/layout";

const pageTitle = "User Settings";

const SettingsLayout: FunctionComponent = ({ children }) => {
	const router = useRouter();

	return (
		<Layout title={pageTitle}>
			<header className="px-4 sm:px-6 md:px-0">
				<header className="flex">
					<span className="flex items-center cursor-pointer" onClick={router.back}>
						<FontAwesomeIcon className="h-8 w-8 mr-2" icon={faChevronLeft} /> Back
					</span>
				</header>
			</header>

			<main>{children}</main>
		</Layout>
	);
};

export default SettingsLayout;
