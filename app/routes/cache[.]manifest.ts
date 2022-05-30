import type { LoaderFunction } from "@remix-run/node";

const manifest = `CACHE MANIFEST

# Version 1.0000

NETWORK:
*
`;

export const loader: LoaderFunction = async () => {
	const headers = new Headers({
		"Content-Type": "text/cache-manifest",
		"Cache-Control": "max-age=0, no-cache, no-store, must-revalidate",
		Pragma: "no-cache",
		Expires: "Thu, 01 Jan 1970 00:00:01 GMT",
	});

	return new Response(manifest, { headers });
};
