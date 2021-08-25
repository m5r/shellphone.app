import { useState, useRef, useEffect, MouseEventHandler } from "react";
import { Link } from "blitz";
import { Menu, Transition } from "@headlessui/react";

function Header() {
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	const trigger = useRef<HTMLButtonElement>(null);
	const mobileNav = useRef<HTMLElement>(null);

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
		<header className="absolute w-full z-30">
			<div className="max-w-6xl mx-auto px-4 sm:px-6">
				<div className="flex items-center justify-between h-20">
					{/* Site branding */}
					<div className="flex-shrink-0 mr-5">
						{/* Logo */}
						<Link href="/">
							<a className="block">
								<svg className="w-8 h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
									<defs>
										<linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="logo_a">
											<stop stopColor="#3ABAB4" offset="0%" />
											<stop stopColor="#7F9CF5" offset="100%" />
										</linearGradient>
										<linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="logo_b">
											<stop stopColor="#3ABAB4" offset="0%" />
											<stop stopColor="#3ABAB4" stopOpacity="0" offset="100%" />
										</linearGradient>
									</defs>
									<path
										d="M32 16h-8a8 8 0 10-16 0H0C0 7.163 7.163 0 16 0s16 7.163 16 16z"
										fill="url(#logo_a)"
									/>
									<path
										d="M32 16c0 8.837-7.163 16-16 16S0 24.837 0 16h8a8 8 0 1016 0h8z"
										fill="url(#logo_b)"
									/>
								</svg>
							</a>
						</Link>
					</div>

					{/* Desktop navigation */}
					<nav className="hidden md:flex md:flex-grow">
						{/* Desktop menu links */}
						<ul className="flex flex-grow flex-wrap items-center font-medium">
							<li>
								<Link href="/about">
									<a className="text-gray-600 hover:text-gray-900 px-5 py-2 flex items-center transition duration-150 ease-in-out">
										About
									</a>
								</Link>
							</li>
							<li>
								<Link href="/blog">
									<a className="text-gray-600 hover:text-gray-900 px-5 py-2 flex items-center transition duration-150 ease-in-out">
										Blog
									</a>
								</Link>
							</li>
							<li>
								<Link href="/testimonials">
									<a className="text-gray-600 hover:text-gray-900 px-5 py-2 flex items-center transition duration-150 ease-in-out">
										Testimonials
									</a>
								</Link>
							</li>
						</ul>

						{/* Desktop CTA on the right */}
						<ul className="flex justify-end flex-wrap items-center">
							<li>
								<Link href="/contact">
									<a className="btn-sm text-white bg-teal-500 hover:bg-teal-400 ml-6">Request code</a>
								</Link>
							</li>
						</ul>
					</nav>

					{/* Mobile menu */}
					<div className="inline-flex md:hidden">
						{/* Hamburger button */}
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

						{/*Mobile navigation */}
						<Transition
							show={mobileNavOpen}
							as="ul"
							className="fixed top-0 h-screen z-20 left-0 w-full max-w-sm -ml-16 overflow-scroll bg-white shadow-lg"
							enter="transition ease-out duration-200 transform"
							enterFrom="opacity-0 -translate-x-full"
							enterTo="opacity-100 translate-x-0"
							leave="transition ease-out duration-200"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<nav
								id="mobile-nav"
								ref={mobileNav}
								className="fixed top-0 h-screen z-20 left-0 w-full max-w-sm -ml-16 overflow-scroll bg-white shadow-lg no-scrollbar"
							>
								<div className="py-6 pr-4 pl-20">
									{/* Logo */}
									<svg className="w-8 h-8" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
										<defs>
											<linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="menulogo_a">
												<stop stopColor="#3ABAB4" offset="0%" />
												<stop stopColor="#7F9CF5" offset="100%" />
											</linearGradient>
											<linearGradient x1="26%" y1="100%" x2="100%" y2="100%" id="menulogo_b">
												<stop stopColor="#3ABAB4" offset="0%" />
												<stop stopColor="#3ABAB4" stopOpacity="0" offset="100%" />
											</linearGradient>
										</defs>
										<path
											d="M32 16h-8a8 8 0 10-16 0H0C0 7.163 7.163 0 16 0s16 7.163 16 16z"
											fill="url(#menulogo_a)"
										/>
										<path
											d="M32 16c0 8.837-7.163 16-16 16S0 24.837 0 16h8a8 8 0 1016 0h8z"
											fill="url(#menulogo_b)"
										/>
									</svg>
									{/* Links */}
									<ul>
										<li>
											<Link href="/about">
												<a className="flex text-gray-600 hover:text-gray-900 py-2">About</a>
											</Link>
										</li>
										<li>
											<Link href="/blog">
												<a className="flex text-gray-600 hover:text-gray-900 py-2">Blog</a>
											</Link>
										</li>
										<li>
											<Link href="/testimonials">
												<a className="flex text-gray-600 hover:text-gray-900 py-2">
													Testimonials
												</a>
											</Link>
										</li>
										<li>
											<Link href="/contact">
												<a className="font-medium w-full inline-flex items-center justify-center border border-transparent px-4 py-2 my-2 rounded text-white bg-teal-500 hover:bg-teal-400 transition duration-150 ease-in-out">
													Request code
												</a>
											</Link>
										</li>
									</ul>
								</div>
							</nav>
						</Transition>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;
