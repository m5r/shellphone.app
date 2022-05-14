import type { ReactNode } from "react";
import { NavLink } from "@remix-run/react";
import { IoCall, IoKeypad, IoChatbubbles, IoSettings } from "react-icons/io5";
import clsx from "clsx";

export default function Footer() {
	return (
		<footer
			className="grid grid-cols-4 bg-[#F7F7F7] border-t border-gray-400 border-opacity-25 py-3 z-10"
			style={{ flex: "0 0 50px" }}
		>
			<FooterLink label="Calls" path="/calls" icon={<IoCall className="w-6 h-6" />} />
			<FooterLink label="Keypad" path="/keypad" icon={<IoKeypad className="w-6 h-6" />} />
			<FooterLink label="Messages" path="/messages" icon={<IoChatbubbles className="w-6 h-6" />} />
			<FooterLink label="Settings" path="/settings" icon={<IoSettings className="w-6 h-6" />} />
		</footer>
	);
}

type FooterLinkProps = {
	path: string;
	label: string;
	icon: ReactNode;
};

function FooterLink({ path, label, icon }: FooterLinkProps) {
	return (
		<div className="flex flex-col items-center justify-around h-full">
			<NavLink
				to={path}
				prefetch="none"
				className={({ isActive }) =>
					clsx("flex flex-col items-center", {
						"text-primary-500": isActive,
						"text-[#959595]": !isActive,
					})
				}
			>
				{icon}
				<span className="text-xs">{label}</span>
			</NavLink>
		</div>
	);
}