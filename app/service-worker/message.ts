import type { AssetsManifest } from "@remix-run/react/entry";

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
