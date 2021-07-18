import type { FunctionComponent } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/pro-regular-svg-icons";

import Layout from "../layout";

import useUser from "../../hooks/use-user";

const pageTitle = "User Settings";

const SettingsLayout: FunctionComponent = ({ children }) => {
	const user = useUser();
	const router = useRouter();

	if (user.isLoading) {
		return (
			<Layout title={pageTitle}>
				<section className="px-4 py-4 sm:px-6 md:px-0">
					Loading...
				</section>
			</Layout>
		);
	}

	if (user.error) {
		return (
			<Layout title={pageTitle}>
				<section className="px-4 py-4 sm:px-6 md:px-0">
					<p className="py-2">Oops, something unexpected happened!</p>
					<pre>{user.error.message}</pre>
				</section>
			</Layout>
		);
	}

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
