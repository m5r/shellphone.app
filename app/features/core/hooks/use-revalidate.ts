import { useFetcher } from "@remix-run/react";

export default function useRevalidate() {
	const fetcher = useFetcher();
	return () => fetcher.submit({}, { method: "post", action: "/dev/null" });
}
