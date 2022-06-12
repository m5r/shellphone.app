import { useEffect } from "react";

import useRevalidate from "./use-revalidate";

export default function useServiceWorkerRevalidate() {
	const revalidate = useRevalidate();

	useEffect(() => {
		const channel = new BroadcastChannel("revalidate");
		function onMessage(event: MessageEvent) {
			const isRefresh = event.data === "revalidateLoaderData";
			if (isRefresh) {
				console.debug("Revalidating loaders data");
				revalidate();
			}
		}

		channel.addEventListener("message", onMessage);
		return () => {
			channel.removeEventListener("message", onMessage);
			channel.close();
		};
	}, [revalidate]);
}
