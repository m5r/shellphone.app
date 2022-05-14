import { Link, Outlet } from "@remix-run/react";

import Logo from "~/features/core/components/logo";

export default function AuthLayout() {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-8">
			<div className="mx-auto">
				<Link to="/" prefetch="intent">
					<Logo className="mx-auto w-16" />
				</Link>
			</div>
			<Outlet />
		</div>
	);
}
