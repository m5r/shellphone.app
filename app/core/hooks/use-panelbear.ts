import { useEffect } from "react";
import { useRouter } from "next/router";
import * as Panelbear from "@panelbear/panelbear-js";
import type { PanelbearConfig } from "@panelbear/panelbear-js";

export const usePanelbear = (siteId?: string, config: PanelbearConfig = {}) => {
	const router = useRouter();

	useEffect(() => {
		if (!siteId) {
			return;
		}

		Panelbear.load(siteId, { scriptSrc: "/bear.js", ...config });
		Panelbear.trackPageview();
		const handleRouteChange = () => Panelbear.trackPageview();
		router.events.on("routeChangeComplete", handleRouteChange);

		return () => router.events.off("routeChangeComplete", handleRouteChange);
	}, [siteId]);
};
