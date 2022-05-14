import clsx from "clsx";

export default function Divider({ className = "" }) {
	return (
		<div className={clsx(className, "relative")}>
			<div className="absolute inset-0 flex items-center">
				<div className="w-full border-t border-gray-300" />
			</div>
		</div>
	);
}
