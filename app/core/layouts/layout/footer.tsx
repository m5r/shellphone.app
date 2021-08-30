import type { ReactNode } from "react";
import { Link, useRouter } from "blitz";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPhoneAlt as fasPhone,
	faTh as fasTh,
	faComments as fasComments,
	faCog as fasCog,
} from "@fortawesome/pro-solid-svg-icons";
import clsx from "clsx";

export default function Footer() {
	return (
		<footer
			className="grid grid-cols-4 bg-[#F7F7F7] border-t border-gray-400 border-opacity-25 py-3"
			style={{ flex: "0 0 50px" }}
		>
			<NavLink
				label="Calls"
				path="/calls"
				icon={<FontAwesomeIcon size="lg" className="w-6 h-6" icon={fasPhone} />}
			/>
			<NavLink
				label="Keypad"
				path="/keypad"
				icon={<FontAwesomeIcon size="lg" className="w-6 h-6" icon={fasTh} />}
			/>
			<NavLink
				label="Messages"
				path="/messages"
				icon={<FontAwesomeIcon size="lg" className="w-6 h-6" icon={fasComments} />}
			/>
			<NavLink
				label="Settings"
				path="/settings"
				icon={<FontAwesomeIcon size="lg" className="w-6 h-6" icon={fasCog} />}
			/>
		</footer>
	);
}

type NavLinkProps = {
	path: string;
	label: string;
	icon: ReactNode;
};

function NavLink({ path, label, icon }: NavLinkProps) {
	const router = useRouter();
	const isActiveRoute = router.pathname.startsWith(path);

	return (
		<div className="flex flex-col items-center justify-around h-full">
			<Link href={path}>
				<a
					className={clsx("flex flex-col items-center", {
						"text-[#007AFF]": isActiveRoute,
						"text-[#959595]": !isActiveRoute,
					})}
				>
					{icon}
					<span className="text-xs">{label}</span>
				</a>
			</Link>
		</div>
	);
}
