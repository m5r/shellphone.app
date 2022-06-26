import { useEffect } from "react";
import { useLocation } from "@remix-run/react";
import * as Panelbear from "@panelbear/panelbear-js";
import type { PanelbearConfig } from "@panelbear/panelbear-js";

export default function usePanelbear(siteId: string, config: PanelbearConfig = {}) {
	const location = useLocation();

	useEffect(() => {
		Panelbear.load(siteId, {
			scriptSrc: "/bear.js",
			spaMode: "off",
			autoTrack: false,
			...config,
		});
	}, []);

	useEffect(() => {
		Panelbear.trackPageview();
	}, [location]);
}
