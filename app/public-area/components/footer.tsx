import type { FunctionComponent } from "react";
import type { LinkProps } from "blitz";
import { Link, Routes } from "blitz";

export default function Footer() {
	// TODO
	const isDisabled = true;
	if (isDisabled) {
		return null;
	}

	return (
		<footer className="bg-white">
			<div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
				<nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
					<NavLink href={Routes.Blog()} name="Blog" />
					<NavLink href={Routes.PrivacyPolicy()} name="Privacy Policy" />
					<NavLink href={Routes.TermsOfService()} name="Terms of Service" />
					<NavLink href="mailto:support@shellphone.app" name="Email Us" />
				</nav>
				<p className="mt-8 text-center text-base text-gray-400">
					&copy; 2021 Capsule Corp. Dev Pte. Ltd. All rights reserved.
					{/*&copy; 2021 Mokhtar Mial All rights reserved.*/}
				</p>
			</div>
		</footer>
	);
}

type Props = {
	href: LinkProps["href"];
	name: string;
};

const NavLink: FunctionComponent<Props> = ({ href, name }) => (
	<div className="px-5 py-2">
		<Link href={href}>
			<a className="text-base text-gray-500 hover:text-gray-900">{name}</a>
		</Link>
	</div>
);
