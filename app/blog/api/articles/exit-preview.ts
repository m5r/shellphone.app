import type { BlitzApiRequest, BlitzApiResponse } from "blitz";

export default async function preview(req: BlitzApiRequest, res: BlitzApiResponse) {
	// Exit the current user from "Preview Mode". This function accepts no args.
	res.clearPreviewData();

	// Redirect the user back to the index page.
	res.writeHead(307, { Location: "/" });
	res.end();
}
