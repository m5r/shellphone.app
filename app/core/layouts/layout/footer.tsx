import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPhoneAlt as fasPhone,
	faTh as fasTh,
	faComments as fasComments,
	faCog as fasCog,
} from "@fortawesome/pro-solid-svg-icons";
import {
	faPhoneAlt as farPhone,
	faTh as farTh,
	faComments as farComments,
	faCog as farCog,
} from "@fortawesome/pro-regular-svg-icons";

export default function Footer() {
	return (
		<footer className="grid grid-cols-4" style={{ flex: "0 0 50px" }}>
			<NavLink
				label="Calls"
				path="/calls"
				icons={{
					active: <FontAwesomeIcon size="lg" className="w-6 h-6" icon={fasPhone} />,
					inactive: <FontAwesomeIcon size="lg" className="w-6 h-6" icon={farPhone} />,
				}}
			/>
			<NavLink
				label="Keypad"
				path="/keypad"
				icons={{
					active: <FontAwesomeIcon size="lg" className="w-6 h-6" icon={fasTh} />,
					inactive: <FontAwesomeIcon size="lg" className="w-6 h-6" icon={farTh} />,
				}}
			/>
			<NavLink
				label="Messages"
				path="/messages"
				icons={{
					active: <FontAwesomeIcon size="lg" className="w-6 h-6" icon={fasComments} />,
					inactive: <FontAwesomeIcon size="lg" className="w-6 h-6" icon={farComments} />,
				}}
			/>
			<NavLink
				label="Settings"
				path="/settings"
				icons={{
					active: <FontAwesomeIcon size="lg" className="w-6 h-6" icon={fasCog} />,
					inactive: <FontAwesomeIcon size="lg" className="w-6 h-6" icon={farCog} />,
				}}
			/>
		</footer>
	);
}

type NavLinkProps = {
	path: string;
	label: string;
	icons: {
		active: ReactNode;
		inactive: ReactNode;
	};
};

function NavLink({ path, label, icons }: NavLinkProps) {
	const router = useRouter();
	const isActiveRoute = router.pathname.startsWith(path);
	const icon = isActiveRoute ? icons.active : icons.inactive;

	return (
		<div className="flex flex-col items-center justify-around h-full">
			<Link href={path}>
				<a className="flex flex-col items-center">
					{icon}
					<span className="text-xs">{label}</span>
				</a>
			</Link>
		</div>
	);
}
