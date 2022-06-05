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

export function cacheAsset(event: FetchEvent): Promise<Response> {
	// stale-while-revalidate
	const url = new URL(event.request.url);
	return caches
		.match(event.request, {
			cacheName: ASSET_CACHE,
			ignoreVary: true,
			ignoreSearch: true,
		})
		.then((cachedResponse) => {
			console.debug(`Serving asset from ${cachedResponse ? "cache" : "network"}`, url.pathname);

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

// stores the timestamp for when each URL's cached response has been revalidated
const lastTimeRevalidated: Record<string, number> = {};

export function cacheLoaderData(event: FetchEvent): Promise<Response> {
	/*if (searchParams.get("_refresh") === "groot") {
		console.debug("Serving refreshed data from network", url.pathname + url.search);
		return event.preloadResponse
			.then((preloadedResponse?: Response) => preloadedResponse || fetch(event.request.clone()))
			.then((response) =>
				caches
					.open(DATA_CACHE)
					.then((cache) => cache.put(event.request, response.clone()))
					.then(() =>
						response
							.clone()
							.json()
							.then(({ json }) => console.debug("ddd", json?.phoneCalls?.[0]?.recipient)),
					)
					.then(() => {
						console.debug("returned latest", Date.now());
						return response;
					}),
			)
			.catch(() => {
				console.debug("Serving data from network failed, falling back to cache", url.pathname + url.search);
				return caches.match(url).then((response) => {
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
	}*/

	/*return caches.match(event.request, { cacheName: DATA_CACHE }).then((cachedResponse) => {
		console.debug(`Serving data from ${cachedResponse ? "cache" : "network"}`, url.pathname + url.search);
		cachedResponse?.headers.set("X-Remix-Worker", "yes");

		const fetchPromise = event.preloadResponse
			.then((preloadedResponse?: Response) => preloadedResponse || fetch(event.request.clone()))
			.then((response) =>
				caches.open(DATA_CACHE).then((cache) => {
					response.text().then(rrr => console.log(response.ok, url.pathname + url.search, rrr));
					if (!response.ok) {
						return json(
							{ message: "Network Error" },
							{
								status: 500,
								headers: { "X-Remix-Catch": "yes", "X-Remix-Worker": "yes" },
							},
						);
					}

					cache.put(event.request, response.clone());
					const timestamp = lastTimeResponded[url.pathname + url.search];
					console.log("timestamp - Date.now()", Date.now() - timestamp);

					/!*if (timestamp && (Date.now() - timestamp > 10 * 1000)) {
						console.debug("update UI with latest", Date.now());
						// we already returned the cached response
						// we need to update the UI with the latest data
						const message = {
							type: "revalidateLoaderData",
							// href: url.pathname + "?_refresh=groot",
						};
						const channel = new BroadcastChannel("sw-messages");
						channel.postMessage(JSON.stringify(message));
					}*!/

					return response;
				}),
			);

		if (cachedResponse) {
			console.debug("returned cached", Date.now());
			lastTimeResponded[url.pathname + url.search] = Date.now();
		}
		return fetchPromise.then(response => {
			console.debug("returned networked", Date.now());
			lastTimeResponded[url.pathname + url.search] = Date.now();
			return response;
		})
	});*/

	const url = new URL(event.request.url);
	const path = url.pathname + url.search;

	return caches.match(event.request, { cacheName: DATA_CACHE }).then((cachedResponse) => {
		console.debug(`Serving data from ${cachedResponse ? "cache" : "network"}`, path);
		cachedResponse?.headers.set("X-Remix-Worker", "yes");

		const timestamp = lastTimeRevalidated[path] ?? 0;
		const diff = Date.now() - timestamp;
		const TEN_SECONDS = 10 * 1000;
		if (cachedResponse && diff < TEN_SECONDS) {
			console.debug("Returned response from cache after a revalidation no older than 10s");
			// TODO: see if we can check a header or something to see if the requests comes from the revalidation thing
			return cachedResponse;
		}

		const fetchPromise = event.preloadResponse
			.then((preloadedResponse?: Response) => preloadedResponse || fetch(event.request.clone()))
			.then((response) =>
				caches.open(DATA_CACHE).then((cache) => {
					if (!response.ok) {
						return json(
							{ message: "Network Error" },
							{
								status: 500,
								headers: { "X-Remix-Catch": "yes", "X-Remix-Worker": "yes" },
							},
						);
					}

					const clonedResponse = response.clone();
					cache.match(event.request).then(async (cached) => {
						if (!cached) {
							// we had nothing cached, simply cache what we got
							await cache.put(event.request, clonedResponse.clone());
							return;
						}

						if (await areResponsesEqual(cached.clone(), clonedResponse.clone())) {
							// if what we have in the cache is up-to-date, we don't have to do anything
							console.debug("Responses are the same, no need to revalidate", path);
							return;
						}

						// otherwise, cache the new response
						await cache.put(event.request, clonedResponse.clone());

						if (cachedResponse) {
							// and if we had returned a cached response
							// tell the UI to fetch the latest data
							console.debug("Revalidate loader data", path);
							const channel = new BroadcastChannel("sw-messages");
							channel.postMessage("revalidateLoaderData");
							lastTimeRevalidated[path] = Date.now();
						}
					});

					return response;
				}),
			);

		return cachedResponse || fetchPromise;
	});
}

async function areResponsesEqual(a: Response, b: Response): Promise<boolean> {
	const viewA = new DataView(await a.arrayBuffer());
	const viewB = new DataView(await b.arrayBuffer());

	if (viewA === viewB) {
		return true;
	}

	if (viewA.byteLength !== viewB.byteLength) {
		return false;
	}

	let i = viewA.byteLength;
	while (i--) {
		if (viewA.getUint8(i) !== viewB.getUint8(i)) {
			return false;
		}
	}

	return true;
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

export async function deleteCaches() {
	const allCaches = await caches.keys();
	await Promise.all(allCaches.map((cacheName) => caches.delete(cacheName)));
	console.debug("Caches deleted");
}
