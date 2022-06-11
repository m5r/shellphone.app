import {
	fetchAsset,
	fetchDocument,
	fetchLoaderData,
	isAssetRequest,
	isDocumentGetRequest,
	isLoaderRequest,
} from "./cache-utils";

declare const self: ServiceWorkerGlobalScope;

export default async function handleFetch(event: FetchEvent) {
	if (isAssetRequest(event.request)) {
		return fetchAsset(event);
	}

	if (isLoaderRequest(event.request)) {
		return fetchLoaderData(event);
	}

	if (isDocumentGetRequest(event.request)) {
		return fetchDocument(event);
	}

	return fetch(event.request);
}
