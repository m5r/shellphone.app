import type { ServerResponse } from "http";

export function redirect(res: ServerResponse, to: string) {
	res.writeHead(302, { Location: encodeURI(to) });
	res.end();
}
