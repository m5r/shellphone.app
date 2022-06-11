import {
	fetchAsset,
	fetchDocument,
	fetchLoaderData,
	isAssetRequest,
	isDocumentGetRequest,
	isLoaderRequest,
	isMutationRequest,
	purgeMutatedLoaders,
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

	if (isMutationRequest(event.request)) {
		await purgeMutatedLoaders(event);
	}

	return fetch(event.request);
}
