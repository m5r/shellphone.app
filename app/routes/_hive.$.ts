import type { ActionFunction } from "remix";

async function proxyHive(request: Request) {
	const url = new URL(request.url);
	const req = new Request("https://hive.splitbee.io" + url.pathname.replace("/_hive", ""), {
		...request,
		signal: null,
	});
	req.headers.set("x-country", request.headers.get("cf-ipcountry")!);
	req.headers.set("x-real-ip", request.headers.get("x-real-ip")!);
	return fetch(req);
}

export const action: ActionFunction = ({ request }) => proxyHive(request);
