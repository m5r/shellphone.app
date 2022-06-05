import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";

export default function useServiceWorkerRevalidate() {
	const fetcher = useFetcher();

	useEffect(() => {
		const channel = new BroadcastChannel("sw-messages");
		function onMessage(event: MessageEvent) {
			const isRefresh = event.data === "revalidateLoaderData";
			if (isRefresh) {
				console.debug("Revalidating loaders data");
				fetcher.submit({}, { method: "post", action: "/dev/null" });
			}
		}

		channel.addEventListener("message", onMessage);
		return () => {
			channel.removeEventListener("message", onMessage);
			channel.close();
		};
	}, [fetcher]);
}
