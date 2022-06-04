import { json } from "@remix-run/server-runtime";

export const ASSET_CACHE = "asset-cache";
export const DATA_CACHE = "data-cache";
export const DOCUMENT_CACHE = "document-cache";

export function isAssetRequest(request: Request) {
	return ["font", "image", "script", "style"].includes(request.destination);
}

export function isLoaderRequest(request: Request) {
	const url = new URL(request.url);
	return request.method.toLowerCase() === "get" && url.searchParams.get("_data");
}

export function isDocumentGetRequest(request: Request) {
	return request.method.toLowerCase() === "get" && request.mode === "navigate";
}

export function cacheAsset(event: FetchEvent) {
	// stale-while-revalidate
	const url = new URL(event.request.url);
	return caches
		.match(event.request, {
			cacheName: ASSET_CACHE,
			ignoreVary: true,
			ignoreSearch: true,
		})
		.then((cachedResponse) => {
			console.debug(`Serving asset from ${cachedResponse ? "cache" : " network"}`, url.pathname);

			const fetchPromise = event.preloadResponse
				.then((preloadedResponse?: Response) => preloadedResponse || fetch(event.request.clone()))
				.then((response) =>
					caches.open(ASSET_CACHE).then((cache) => {
						switch (response.status) {
							case 200:
								cache.put(event.request, response.clone());
								break;
							case 404:
								cache.delete(event.request);
								break;
						}

						return response;
					}),
				);

			return cachedResponse || fetchPromise;
		});
}

export function cacheLoaderData(event: FetchEvent) {
	// network-first
	const url = new URL(event.request.url);
	console.debug("Serving data from network", url.pathname + url.search);

	return event.preloadResponse
		.then((preloadedResponse?: Response) => preloadedResponse || fetch(event.request.clone()))
		.then((response) =>
			caches
				.open(DATA_CACHE)
				.then((cache) => cache.put(event.request, response.clone()))
				.then(() => response),
		)
		.catch(() => {
			console.debug("Serving data from network failed, falling back to cache", url.pathname + url.search);
			return caches.match(event.request).then((response) => {
				if (!response) {
					return json(
						{ message: "Network Error" },
						{
							status: 500,
							headers: { "X-Remix-Catch": "yes", "X-Remix-Worker": "yes" },
						},
					);
				}

				response.headers.set("X-Remix-Worker", "yes");
				return response;
			});
		});
}

export function cacheDocument(event: FetchEvent): Promise<Response> {
	// network-first
	const url = new URL(event.request.url);
	console.debug("Serving document from network", url.pathname);
	return caches.open(DOCUMENT_CACHE).then((cache) =>
		fetch(event.request.clone())
			.then((response) => {
				cache.put(event.request, response.clone());
				return response;
			})
			.catch((error) => {
				console.debug("Serving document from network failed, falling back to cache", url.pathname);
				return caches.match(event.request).then((response) => {
					if (!response) {
						throw error;
					}

					return response;
				});
			}),
	);
}
