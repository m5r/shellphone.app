import clsx from "clsx";

import styles from "./spinner.module.css";

export default function Spinner() {
	return (
		<div className="h-full flex">
			<div className={clsx(styles.ring, "m-auto text-primary-400")} />
		</div>
	);
}
