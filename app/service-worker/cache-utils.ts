import { json } from "@remix-run/server-runtime";

declare const ASSET_CACHE: string;
declare const DATA_CACHE: string;
declare const DOCUMENT_CACHE: string;

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

export function isMutationRequest(request: Request) {
	return ["POST", "DELETE"].includes(request.method);
}

export function fetchAsset(event: FetchEvent): Promise<Response> {
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

export function fetchLoaderData(event: FetchEvent): Promise<Response> {
	const url = new URL(event.request.url);
	if (url.pathname === "/outgoing-call/twilio-token") {
		return fetch(event.request);
	}

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

		const request = cachedResponse
			? new Request(event.request.clone(), { cache: "reload" })
			: event.request.clone();
		const fetchPromise = event.preloadResponse
			.then((preloadedResponse?: Response) => preloadedResponse || fetch(request))
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

						// otherwise, cache the new response
						await cache.put(event.request, clonedResponse.clone());

						if (await areResponsesEqual(cached.clone(), clonedResponse.clone())) {
							// if what we have in the cache is up-to-date, we don't have to do anything
							console.debug("Responses are the same, no need to revalidate", path);
							lastTimeRevalidated[path] = Date.now();
							return;
						}

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

export function fetchDocument(event: FetchEvent): Promise<Response> {
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
	const cachesToDelete = allCaches.filter((cacheName) => cacheName !== ASSET_CACHE);
	await Promise.all(cachesToDelete.map((cacheName) => caches.delete(cacheName)));
	console.debug("Old caches deleted");
}

export async function purgeMutatedLoaders(event: FetchEvent) {
	const url = new URL(event.request.url);
	const rootPathname = "/" + url.pathname.split("/")[1];
	const cache = await caches.open(DATA_CACHE);
	const cachedLoaders = await cache.keys();

	const loadersToDelete = cachedLoaders.filter((loader) => {
		const cachedPathname = new URL(loader.url).pathname;
		const shouldPurge = cachedPathname.startsWith(rootPathname);

		if (url.pathname === "/settings/phone") {
			// changes phone number or twilio account credentials
			// so purge messages and phone calls from cache
			return (
				shouldPurge ||
				["/messages", "/calls", "/keypad"].some((pathname) => cachedPathname.startsWith(pathname))
			);
		}

		return shouldPurge;
	});
	await Promise.all(loadersToDelete.map((loader) => cache.delete(loader)));
	console.debug("Purged loaders data starting with", rootPathname);
}
