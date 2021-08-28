import { Link } from "blitz";

function Header() {
	return (
		<header className="absolute w-full z-30">
			<div className="max-w-6xl mx-auto px-4 sm:px-6">
				<div className="flex items-center justify-between h-20">
					{/* Site branding */}
					<div className="flex-shrink-0 mr-5">
						{/* Logo */}
						<Link href="/">
							<a className="block">
								<img className="w-10 h-10" src="/shellphone.png" />
							</a>
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;
