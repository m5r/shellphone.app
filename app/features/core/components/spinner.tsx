import type { LinksFunction } from "@remix-run/node";

import styles from "./spinner.css";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: styles },
];

export default function Spinner() {
	return (
		<div className="h-full flex">
			<div className="ring m-auto text-primary-400" />
		</div>
	);
}
