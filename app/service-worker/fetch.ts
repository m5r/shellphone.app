declare let self: ServiceWorkerGlobalScope;

export default async function handleFetch(event: FetchEvent & { preloadResponse?: Promise<Response | undefined> }) {
	const preloaded = await event.preloadResponse;
	if (preloaded) {
		return preloaded;
	}

	return fetch(event.request);
}
