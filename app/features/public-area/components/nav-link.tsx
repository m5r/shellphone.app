import type { PropsWithChildren } from "react";
import { Link } from "@remix-run/react";

export default function NavLink({ href, children }: PropsWithChildren<{ href: string }>) {
	return (
		<Link
			to={href}
			className="inline-block rounded-lg py-1 px-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900"
		>
			{children}
		</Link>
	);
}
