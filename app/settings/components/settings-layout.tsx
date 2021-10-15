import type { FunctionComponent } from "react";
import { Link, Routes, useMutation, useRouter } from "blitz";
import clsx from "clsx";
import {
	IoChevronBack,
	IoLogOutOutline,
	IoNotificationsOutline,
	IoCardOutline,
	IoPersonCircleOutline,
} from "react-icons/io5";

import Layout from "app/core/layouts/layout";
import logout from "app/auth/mutations/logout";
import Divider from "./divider";

const subNavigation = [
	{ name: "Account", href: Routes.Account(), icon: IoPersonCircleOutline },
	{ name: "Billing", href: Routes.Billing(), icon: IoCardOutline },
	{ name: "Notifications", href: Routes.Notifications(), icon: IoNotificationsOutline },
];

const SettingsLayout: FunctionComponent = ({ children }) => {
	const router = useRouter();
	const [logoutMutation] = useMutation(logout);

	return (
		<Layout title="Settings">
			<header className="bg-gray-100 px-2 sm:px-6 lg:px-8">
				<header className="flex">
					<span className="flex items-center cursor-pointer" onClick={router.back}>
						<IoChevronBack className="h-8 w-8 mr-2" /> Back
					</span>
				</header>
			</header>

			<main className="flex flex-col flex-grow mx-auto w-full max-w-7xl pb-10 lg:py-12 lg:px-8">
				<div className="flex flex-col flex-grow lg:grid lg:grid-cols-12 lg:gap-x-5">
					<aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
						<nav className="h-full flex flex-col">
							{subNavigation.map((item) => {
								const isCurrentPage = item.href.pathname === router.pathname;

								return (
									<Link key={item.name} href={item.href}>
										<a
											className={clsx(
												isCurrentPage
													? "bg-gray-50 text-primary-600 hover:bg-white"
													: "text-gray-900 hover:text-gray-900 hover:bg-gray-50",
												"mb-1 group rounded-md px-3 py-2 flex items-center text-sm font-medium",
											)}
											aria-current={isCurrentPage ? "page" : undefined}
										>
											<item.icon
												className={clsx(
													isCurrentPage
														? "text-primary-500"
														: "text-gray-400 group-hover:text-gray-500",
													"flex-shrink-0 -ml-1 mr-3 h-6 w-6",
												)}
												aria-hidden="true"
											/>
											<span className="truncate">{item.name}</span>
										</a>
									</Link>
								);
							})}

							<Divider className="mt-auto mb-1" />
							<button
								onClick={() => logoutMutation()}
								className="group text-gray-900 hover:text-gray-900 hover:bg-gray-50 rounded-md px-3 py-2 flex items-center text-sm font-medium"
							>
								<IoLogOutOutline className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
								Log out
							</button>
						</nav>
					</aside>

					<div className="flex-grow overflow-y-auto space-y-6 px-2 sm:px-6 lg:col-span-9">{children}</div>
				</div>
			</main>
		</Layout>
	);
};

export default SettingsLayout;
