import type { FunctionComponent } from "react";
import { Link, Routes, useRouter } from "blitz";
import clsx from "clsx";
import { IoChevronBack, IoNotificationsOutline, IoCardOutline, IoPersonCircleOutline } from "react-icons/io5";

import Layout from "../../core/layouts/layout";

const subNavigation = [
	{ name: "Account", href: Routes.Account(), icon: IoPersonCircleOutline },
	{ name: "Billing", href: Routes.Billing(), icon: IoCardOutline },
	{ name: "Notifications", href: Routes.Notifications(), icon: IoNotificationsOutline },
];

const SettingsLayout: FunctionComponent = ({ children }) => {
	const router = useRouter();

	return (
		<Layout title="Settings">
			<header className="bg-gray-100 px-2 sm:px-6 lg:px-8">
				<header className="flex">
					<span className="flex items-center cursor-pointer" onClick={router.back}>
						<IoChevronBack className="h-8 w-8 mr-2" /> Back
					</span>
				</header>
			</header>

			<main className="flex-grow mx-auto w-full max-w-7xl pb-10 lg:py-12 lg:px-8">
				<div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
					<aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
						<nav className="space-y-1">
							{subNavigation.map((item) => {
								const isCurrentPage = item.href.pathname === router.pathname;

								return (
									<Link key={item.name} href={item.href}>
										<a
											className={clsx(
												isCurrentPage
													? "bg-gray-50 text-primary-600 hover:bg-white"
													: "text-gray-900 hover:text-gray-900 hover:bg-gray-50",
												"group rounded-md px-3 py-2 flex items-center text-sm font-medium",
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
						</nav>
					</aside>

					<div className="overflow-y-auto space-y-6 px-2 sm:px-6 lg:px-0 lg:col-span-9">{children}</div>
				</div>
			</main>
		</Layout>
	);
};

export default SettingsLayout;
