import { useEffect, useState } from "react";
import { IoDownloadOutline } from "react-icons/io5";

export default function ServiceWorkerUpdateNotifier() {
	const [hasUpdate, setHasUpdate] = useState(false);
	useEffect(() => {
		if (!("serviceWorker" in navigator)) {
			return;
		}

		(async () => {
			const registration = await navigator.serviceWorker.getRegistration();
			if (!registration) {
				return;
			}

			registration.addEventListener(
				"updatefound",
				() => {
					console.debug("Service Worker update detected");
					const installingWorker = registration.installing;
					if (!installingWorker) {
						return;
					}

					installingWorker.addEventListener("statechange", () => {
						if (installingWorker.state !== "activated") {
							// should maybe retry if state === "redundant"
							console.debug(`Service worker state changed to ${installingWorker.state}`);
							return;
						}

						setHasUpdate(true);
					});
				},
				{ once: true },
			);
		})();
	}, []);

	if (!hasUpdate) {
		return null;
	}

	return (
		<div className="absolute inset-0">
			<button
				onClick={() => {
					setHasUpdate(false);
					location.reload();
				}}
				title="An updated version of the app is available. Reload to get the latest version."
			>
				<IoDownloadOutline
					className="-ml-1 mr-2 h-5 w-5"
					aria-hidden="true"
					aria-label="An updated version of the app is available. Reload to get the latest version."
				/>
			</button>
		</div>
	);
}
