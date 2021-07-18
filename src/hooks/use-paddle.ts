import { useEffect } from "react";
import { useRouter } from "next/router";
import getConfig from "next/config";

declare global {
	interface Window {
		Paddle: any;
	}
}

const { publicRuntimeConfig } = getConfig();

const vendor = publicRuntimeConfig.paddle.vendorId;

export default function usePaddle({
	eventCallback,
}: {
	eventCallback: (data: any) => void;
}) {
	const router = useRouter();

	useEffect(() => {
		if (!window.Paddle) {
			const script = document.createElement("script");
			script.onload = () => {
				window.Paddle.Setup({
					vendor,
					eventCallback(data: any) {
						eventCallback(data);

						if (data.event === "Checkout.Complete") {
							setTimeout(() => router.reload(), 1000);
						}
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
