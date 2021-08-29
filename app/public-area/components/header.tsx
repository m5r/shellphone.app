import { Fragment, useState, useRef, useEffect } from "react";
import type { LinkProps } from "blitz";
import { Link, Routes } from "blitz";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

function Header() {
	return (
		<header className="absolute w-full z-30">
			<div className="max-w-6xl mx-auto px-4 sm:px-6">
				<div className="flex items-center justify-between h-20">
					<div className="flex-shrink-0 mr-5">
						<Link href="/">
							<a className="block">
								<img className="w-10 h-10" src="/shellphone.png" alt="Shellphone logo" />
							</a>
						</Link>
					</div>

					<nav className="hidden md:flex md:flex-grow">
						<ul className="flex flex-grow flex-wrap items-center font-medium">
							<li>
								<DesktopNavLink href={Routes.Roadmap()} label="Roadmap" />
							</li>
							<li>
								<DesktopNavLink href={Routes.OpenMetrics()} label="Open Metrics" />
							</li>
						</ul>
					</nav>

					<MobileNav />
				</div>
			</div>
		</header>
	);
}

type NavLinkProps = {
	href: LinkProps["href"];
	label: string;
};

function DesktopNavLink({ href, label }: NavLinkProps) {
	return (
		<Link href={href}>
			<a className="text-gray-600 hover:text-gray-900 px-5 py-2 flex items-center transition duration-150 ease-in-out">
				{label}
			</a>
		</Link>
	);
}

function MobileNav() {
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	const trigger = useRef<HTMLButtonElement>(null);
	const mobileNav = useRef<HTMLDivElement>(null);

	// close the mobile menu on click outside
	useEffect(() => {
		const clickHandler = ({ target }: MouseEvent) => {
			if (!mobileNav.current || !trigger.current) {
				return;
			}
			console.log(mobileNav.current.contains(target as Node));
			if (
				!mobileNavOpen ||
				mobileNav.current.contains(target as Node) ||
				trigger.current.contains(target as Node)
			) {
				return;
			}
			setMobileNavOpen(false);
		};
		document.addEventListener("click", clickHandler);
		return () => document.removeEventListener("click", clickHandler);
	});

	// close the mobile menu if the esc key is pressed
	useEffect(() => {
		const keyHandler = ({ keyCode }: KeyboardEvent) => {
			if (!mobileNavOpen || keyCode !== 27) return;
			setMobileNavOpen(false);
		};
		document.addEventListener("keydown", keyHandler);
		return () => document.removeEventListener("keydown", keyHandler);
	});

	return (
		<div className="inline-flex md:hidden">
			<button
				ref={trigger}
				className={`hamburger ${mobileNavOpen && "active"}`}
				aria-controls="mobile-nav"
				aria-expanded={mobileNavOpen}
				onClick={() => setMobileNavOpen(!mobileNavOpen)}
			>
				<span className="sr-only">Menu</span>
				<svg
					className="w-6 h-6 fill-current text-gray-900 hover:text-gray-900 transition duration-150 ease-in-out"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect y="4" width="24" height="2" rx="1" />
					<rect y="11" width="24" height="2" rx="1" />
					<rect y="18" width="24" height="2" rx="1" />
				</svg>
			</button>

			<Transition.Root show={mobileNavOpen} as={Fragment}>
				<Dialog as="div" className="fixed z-40 inset-0 overflow-hidden" onClose={setMobileNavOpen}>
					<div className="absolute inset-0 overflow-hidden">
						<Transition.Child
							as={Fragment}
							enter="ease-in-out duration-500"
							enterFrom="opacity-0"
							enterTo="opacity-100"
							leave="ease-in-out duration-500"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Dialog.Overlay className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
						</Transition.Child>

						<div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
							<Transition.Child
								as={Fragment}
								enter="transform transition ease-in-out duration-500 sm:duration-700"
								enterFrom="translate-x-full"
								enterTo="translate-x-0"
								leave="transform transition ease-in-out duration-500 sm:duration-700"
								leaveFrom="translate-x-0"
								leaveTo="translate-x-full"
							>
								<div ref={mobileNav} className="w-screen max-w-xs">
									<div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
										<div className="px-4 sm:px-6">
											<div className="flex items-start justify-between">
												<Dialog.Title className="text-lg font-medium text-gray-900">
													Shellphone
												</Dialog.Title>
												<div className="ml-3 h-7 flex items-center">
													<button
														type="button"
														className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
														onClick={() => setMobileNavOpen(false)}
													>
														<span className="sr-only">Close panel</span>
														<XIcon className="h-6 w-6" aria-hidden="true" />
													</button>
												</div>
											</div>
										</div>
										<div className="mt-6 relative flex-1 px-4 sm:px-6">
											<div className="absolute inset-0 px-4 sm:px-6">
												<ul>
													<li>
														<MobileNavLink href={Routes.Roadmap()} label="Roadmap" />
													</li>
													<li>
														<MobileNavLink
															href={Routes.OpenMetrics()}
															label="Open Metrics"
														/>
													</li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition.Root>
		</div>
	);

	function MobileNavLink({ href, label }: NavLinkProps) {
		return (
			<Link href={href}>
				<a onClick={() => setMobileNavOpen(false)} className="flex text-gray-600 hover:text-gray-900 py-2">
					{label}
				</a>
			</Link>
		);
	}
}

export default Header;
