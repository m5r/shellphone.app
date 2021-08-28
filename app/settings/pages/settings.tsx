import type { BlitzPage } from "blitz";
import { Routes, useMutation } from "blitz";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faUserCircle } from "@fortawesome/pro-regular-svg-icons";

import Layout from "../../core/layouts/layout";

import appLogger from "../../../integrations/logger";
import useRequireOnboarding from "../../core/hooks/use-require-onboarding";
import logout from "../../auth/mutations/logout";

const logger = appLogger.child({ page: "/settings" });

/* eslint-disable react/display-name */
const navigation = [
	{
		name: "Account",
		href: "/settings/account",
		icon: ({ className = "w-8 h-8" }) => <FontAwesomeIcon size="lg" className={className} icon={faUserCircle} />,
	},
	{
		name: "Billing",
		href: "/settings/billing",
		icon: ({ className = "w-8 h-8" }) => <FontAwesomeIcon size="lg" className={className} icon={faCreditCard} />,
	},
];
/* eslint-enable react/display-name */

const Settings: BlitzPage = () => {
	useRequireOnboarding();
	const [logoutMutation] = useMutation(logout);

	return (
		<>
			<div className="flex flex-col space-y-6 p-6">
				<h2 className="text-3xl font-bold">Settings</h2>
			</div>
			<div className="flex flex-col space-y-6 p-6">
				<aside className="py-6 lg:col-span-3">
					<nav className="space-y-1">
						{navigation.map((item) => (
							<a
								key={item.name}
								href={item.href}
								className="border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 group border-l-4 px-3 py-2 flex items-center text-sm font-medium"
							>
								<item.icon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
								<span className="truncate">{item.name}</span>
							</a>
						))}
					</nav>
				</aside>

				<button onClick={() => logoutMutation()}>Log out</button>
			</div>
		</>
	);
};

Settings.getLayout = (page) => <Layout title="Settings">{page}</Layout>;

Settings.authenticate = { redirectTo: Routes.SignIn() };

export default Settings;
