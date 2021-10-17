import { useEffect } from "react";

import Logo from "../../components/logo";
import { Gradient } from "./loader-gradient.js";

import styles from "./loader.module.css";

export default function Loader() {
	useEffect(() => {
		const gradient = new Gradient();
		// @ts-ignore
		gradient.initGradient(`#${styles.gradientCanvas}`);
	}, []);

	return (
		<div className="min-h-screen min-w-screen relative">
			<div className="relative z-10 min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:mx-auto sm:w-full sm:max-w-sm">
					<Logo className="mx-auto h-12 w-12" />
					<span className="mt-2 text-center text-lg leading-9 text-gray-900">Loading up Shellphone...</span>
				</div>
			</div>
			<canvas id={styles.gradientCanvas} className="absolute top-0 z-0" />
		</div>
	);
}
