import { useEffect } from "react";
import { getConfig } from "blitz";

declare global {
	interface Window {
		Paddle: any;
	}
}

const { publicRuntimeConfig } = getConfig();

const vendor = parseInt(publicRuntimeConfig.paddle.vendorId, 10);

export default function usePaddle({ eventCallback }: { eventCallback: (data: any) => void }) {
	useEffect(() => {
		if (!window.Paddle) {
			const script = document.createElement("script");
			script.onload = () => {
				window.Paddle.Setup({
					vendor,
					eventCallback(data: any) {
						eventCallback(data);
					},
				});
			};
			script.src = "https://cdn.paddle.com/paddle/paddle.js";

			document.head.appendChild(script);
			return;
		}
	}, []);

	if (typeof window === "undefined") {
		return { Paddle: null };
	}

	return { Paddle: window.Paddle };
}
