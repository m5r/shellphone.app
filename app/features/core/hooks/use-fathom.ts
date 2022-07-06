import { useEffect } from "react";
import { useLocation } from "@remix-run/react";
import * as Fathom from "fathom-client";

export default function useFathom() {
	const location = useLocation();

	useEffect(() => {
		const { fathom, app } = window.shellphoneConfig;
		Fathom.load(fathom.siteId, {
			spa: "history",
			url: fathom.domain ? `https://${fathom.domain}/script.js` : undefined,
			includedDomains: [app.baseUrl.replace("https://", "")],
		});
	}, []);

	useEffect(() => {
		Fathom.trackPageview();
	}, [location]);
}
