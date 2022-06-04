import type { FetchEventWithPreloadResponse } from "./fetch";

export const ASSET_CACHE = "asset-cache";

export async function cacheAsset(event: FetchEventWithPreloadResponse) {
	const url = new URL(event.request.url);
	const cachedResponse = await caches.match(event.request, {
		cacheName: ASSET_CACHE,
		ignoreVary: true,
		ignoreSearch: true,
	});

	console.debug(`Serving asset from ${cachedResponse ? "cache" : " network"}`, url.pathname);

	const fetchPromise = (async () => {
		const cache = await caches.open(ASSET_CACHE);
		const preloadedResponse = await event.preloadResponse;
		const response = preloadedResponse || (await fetch(event.request));
		switch (response.status) {
			case 200:
				cache.put(event.request, response.clone());
				break;
			case 404:
				cache.delete(event.request);
				break;
		}

		return response;
	})();

	return cachedResponse || fetchPromise;
}
