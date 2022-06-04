import {
	cacheAsset,
	cacheDocument,
	cacheLoaderData,
	isAssetRequest,
	isDocumentGetRequest,
	isLoaderRequest,
} from "~/service-worker/cache-utils";

declare let self: ServiceWorkerGlobalScope;

export default async function handleFetch(event: FetchEvent) {
	if (isAssetRequest(event.request)) {
		return cacheAsset(event);
	}

	if (isLoaderRequest(event.request)) {
		return cacheLoaderData(event);
	}

	if (isDocumentGetRequest(event.request)) {
		return cacheDocument(event);
	}

	return fetch(event.request);
}
