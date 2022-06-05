import type { AssetsManifest } from "@remix-run/react/entry";
import type { EntryRoute } from "@remix-run/react/routes";

import { ASSET_CACHE } from "./cache-utils";

declare let self: ServiceWorkerGlobalScope;

export default async function handleMessage(event: ExtendableMessageEvent) {
	if (event.data.type === "SYNC_REMIX_MANIFEST") {
		return handleSyncRemixManifest(event);
	}
}

async function handleSyncRemixManifest(event: ExtendableMessageEvent) {
	console.debug("Caching routes modules");

	await cacheStaticAssets(event.data.manifest);

	// await cacheConversations(manifest);
}

async function cacheStaticAssets(manifest: AssetsManifest) {
	const cachePromises: Map<string, Promise<void>> = new Map();
	const assetCache = await caches.open(ASSET_CACHE);
	const routes = [...Object.values(manifest.routes), manifest.entry];

	for (const route of routes) {
		if (!cachePromises.has(route.module)) {
			cachePromises.set(route.module, cacheAsset(route.module));
		}

		if (route.imports) {
			for (const assetUrl of route.imports) {
				if (!cachePromises.has(assetUrl)) {
					cachePromises.set(assetUrl, cacheAsset(assetUrl));
				}
			}
		}
	}

	await Promise.all(cachePromises.values());

	async function cacheAsset(assetUrl: string) {
		if (await assetCache.match(assetUrl)) {
			return;
		}

		console.debug("Caching asset", assetUrl);
		return assetCache.add(assetUrl).catch((error) => {
			console.debug(`Failed to cache asset ${assetUrl}:`, error);
		});
	}
}

/*async function cacheConversations(manifest: AssetsManifest) {
	console.log("caching conversation");
	const cachePromises: Map<string, Promise<void>> = new Map();
	const dataCache = await caches.open(DATA_CACHE);
	const messagesResponse = await getMessagesResponse();
	if (!messagesResponse) {
		console.log("rip never happened");
		return;
	}

	const { json } = await messagesResponse.json();
	const recipients = Object.keys(json.conversations);
	recipients.forEach((recipient) => cacheConversation(recipient));

	await Promise.all(cachePromises.values());

	function getMessagesResponse() {
		const route = manifest.routes["routes/__app/messages"];
		const pathname = getPathname(route, manifest);
		const params = new URLSearchParams({ _data: route.id });
		const search = `?${params.toString()}`;
		const url = pathname + search;
		return dataCache.match(url);
	}

	function cacheConversation(recipient: string) {
		const route = manifest.routes["routes/__app/messages.$recipient"];
		const pathname = getPathname(route, manifest).replace(":recipient", encodeURIComponent(recipient));
		const params = new URLSearchParams({ _data: route.id });
		const search = `?${params.toString()}`;
		const url = pathname + search;
		if (!cachePromises.has(url)) {
			console.debug("Caching conversation with", recipient);
			cachePromises.set(
				url,
				dataCache.add(url).catch((error) => {
					console.debug(`Failed to cache data for ${url}:`, error);
				}),
			);
		}
	}
}*/

function getPathname(route: EntryRoute, manifest: AssetsManifest) {
	let pathname = "";
	if (route.path && route.path.length > 0) {
		pathname = "/" + route.path;
	}
	if (route.parentId) {
		const parentPath = getPathname(manifest.routes[route.parentId], manifest);
		if (parentPath) {
			pathname = parentPath + pathname;
		}
	}
	return pathname;
}
