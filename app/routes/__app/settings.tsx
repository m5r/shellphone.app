import type { MetaFunction } from "@remix-run/node";
import { Link, NavLink, Outlet } from "@remix-run/react";
import clsx from "clsx";
import {
	IoLogOutOutline,
	IoNotificationsOutline,
	IoCardOutline,
	IoCallOutline,
	IoPersonCircleOutline,
	IoHelpBuoyOutline,
} from "react-icons/io5";

import Divider from "~/features/settings/components/divider";
import { getSeoMeta } from "~/utils/seo";

const subNavigation = [
	{ name: "Account", to: "/settings/account", icon: IoPersonCircleOutline },
	{ name: "Phone", to: "/settings/phone", icon: IoCallOutline },
	{ name: "Billing", to: "/settings/billing", icon: IoCardOutline },
	{ name: "Notifications", to: "/settings/notifications", icon: IoNotificationsOutline },
	{ name: "Support", to: "/settings/support", icon: IoHelpBuoyOutline },
];

export const meta: MetaFunction = () => ({
	...getSeoMeta({ title: "Settings" }),
});

export default function SettingsLayout() {
	return (
		<section>
			<main className="flex flex-col flex-grow mx-auto w-full max-w-7xl pb-10 lg:py-12 lg:px-8">
				<div className="flex flex-col flex-grow lg:grid lg:grid-cols-12 lg:gap-x-5">
					<aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
						<nav className="space-y-1 h-full flex flex-col">
							{subNavigation.map((item) => (
								<NavLink
									key={item.name}
									to={item.to}
									prefetch="intent"
									className={({ isActive }) =>
										clsx(
											isActive
												? "bg-gray-50 text-primary-600 hover:bg-white"
												: "text-gray-900 hover:text-gray-900 hover:bg-gray-50",
											"group rounded-md px-3 py-2 flex items-center text-sm font-medium",
										)
									}
								>
									{({ isActive }) => (
										<>
											<item.icon
												className={clsx(
													isActive
														? "text-primary-500"
														: "text-gray-400 group-hover:text-gray-500",
													"flex-shrink-0 -ml-1 mr-3 h-6 w-6",
												)}
												aria-hidden="true"
											/>
											<span className="truncate">{item.name}</span>
										</>
									)}
								</NavLink>
							))}

							<Divider />
							<Link
								to="/sign-out"
								className="group text-gray-900 hover:text-gray-900 hover:bg-gray-50 rounded-md px-3 py-2 flex items-center text-sm font-medium"
							>
								<IoLogOutOutline className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
								Log out
							</Link>
						</nav>
					</aside>

					<div className="flex-grow space-y-6 px-2 sm:px-6 lg:col-span-9">
						<Outlet />
					</div>
				</div>
			</main>
		</section>
	);
}
