import { ASSET_CACHE, cacheAsset } from "~/service-worker/cache-utils";

declare let self: ServiceWorkerGlobalScope;

export type FetchEventWithPreloadResponse = FetchEvent & { preloadResponse?: Promise<Response | undefined> };

export default async function handleFetch(event: FetchEventWithPreloadResponse) {
	if (["font", "image", "script", "style"].includes(event.request.destination)) {
		return cacheAsset(event);
	}

	return fetch(event.request);
}
