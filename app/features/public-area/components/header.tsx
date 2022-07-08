import { Link } from "@remix-run/react";

import Button from "./button";
import Container from "./container";
import Logo from "./logo";
import NavLink from "./nav-link";

export default function Header() {
	return (
		<header className="py-10">
			<Container>
				<nav className="relative z-50 flex justify-between">
					<div className="flex items-center md:gap-x-12">
						<Link to="/" aria-label="Home">
							<Logo />
						</Link>
					</div>
					<div className="flex items-center gap-x-5 md:gap-x-8">
						<NavLink href="/sign-in">Have an account?</NavLink>
						<Button
							variant="solid"
							color="primary"
							onClick={() => {
								document.querySelector("#get-started-today")?.scrollIntoView({ behavior: "smooth" });
							}}
						>
							<span>Request access</span>
						</Button>
					</div>
				</nav>
			</Container>
		</header>
	);
}
