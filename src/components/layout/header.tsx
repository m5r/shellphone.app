import type { FunctionComponent } from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import { MenuIcon } from "@heroicons/react/solid";

import Avatar from "../avatar";

import useUser from "../../hooks/use-user";

export default function Header() {
	const { userProfile } = useUser();

	return (
		<header
			style={{ boxShadow: "0 5px 10px -7px rgba(0, 0, 0, 0.0785)" }}
			className="z-30 py-4 bg-white"
		>
			<div className="container flex items-center justify-between h-full px-6 mx-auto text-primary-600">
				<button
					className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none focus:shadow-outline-primary"
					onClick={() => void 0}
					aria-label="Menu"
				>
					<MenuIcon className="w-6 h-6" />
				</button>

				<ul className="flex ml-auto items-center flex-shrink-0 space-x-6">
					<li className="relative">
						<Menu>
							{({ open }) => (
								<>
									<Menu.Button
										className="rounded-full focus:shadow-outline-primary focus:outline-none"
										aria-label="Account"
										aria-haspopup="true"
									>
										<Avatar
											name={userProfile?.email ?? "FSS"}
										/>
									</Menu.Button>

									<Transition
										show={open}
										enter="transition ease-out duration-100"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95"
									>
										<Menu.Items
											className="absolute outline-none right-0 px-1 py-1 divide-y divide-gray-100 z-30 mt-2 origin-top-right text-gray-600 bg-white border border-gray-100 rounded-md shadow-md min-w-max-content"
											static
										>
											<MenuItem href="/account/settings">
												<span>Settings</span>
											</MenuItem>
											<MenuItem href="/api/auth/sign-out">
												<span>Log out</span>
											</MenuItem>
										</Menu.Items>
									</Transition>
								</>
							)}
						</Menu>
					</li>
				</ul>
			</div>
		</header>
	);
}

type MenuItemProps = {
	href: string;
};

const MenuItem: FunctionComponent<MenuItemProps> = ({ children, href }) => (
	<Menu.Item>
		{() => (
			<Link href={href}>
				<a
					className="inline-flex space-x-2 items-center cursor-pointer w-full px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-gray-100 hover:text-gray-800"
					role="menuitem"
				>
					{children}
				</a>
			</Link>
		)}
	</Menu.Item>
);
