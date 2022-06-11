import type { AssetsManifest } from "@remix-run/react/entry";

declare const ASSET_CACHE: string;
declare const self: ServiceWorkerGlobalScope;

export default async function handleMessage(event: ExtendableMessageEvent) {
	if (event.data.type === "SYNC_REMIX_MANIFEST") {
		return handleSyncRemixManifest(event);
	}
}

async function handleSyncRemixManifest(event: ExtendableMessageEvent) {
	console.debug("Caching routes modules");

	const manifest: AssetsManifest = event.data.manifest;
	const routes = [...Object.values(manifest.routes), manifest.entry];
	const assetsToCache: string[] = [];
	for (const route of routes) {
		assetsToCache.push(route.module);

		if (route.imports) {
			assetsToCache.push(...route.imports);
		}
	}

	await purgeStaticAssets(assetsToCache);
	await cacheStaticAssets(assetsToCache);
}

async function cacheStaticAssets(assetsToCache: string[]) {
	const cachePromises: Map<string, Promise<void>> = new Map();
	const assetCache = await caches.open(ASSET_CACHE);

	assetsToCache.forEach((assetUrl) => cachePromises.set(assetUrl, cacheAsset(assetUrl)));
	await Promise.all(cachePromises.values());

	async function cacheAsset(assetUrl: string) {
		if (await assetCache.match(assetUrl)) {
			// no need to update the asset, it has a unique hash in its name
			return;
		}

		console.debug("Caching asset", assetUrl);
		return assetCache.add(assetUrl).catch((error) => {
			console.debug(`Failed to cache asset ${assetUrl}:`, error);
		});
	}
}

async function purgeStaticAssets(assetsToCache: string[]) {
	const assetCache = await caches.open(ASSET_CACHE);
	const cachedAssets = await assetCache.keys();
	const cachesToDelete = cachedAssets.filter((asset) => !assetsToCache.includes(new URL(asset.url).pathname));
	console.log(
		"cachesToDelete",
		cachesToDelete.map((c) => new URL(c.url).pathname),
	);
	await Promise.all(cachesToDelete.map((asset) => assetCache.delete(asset)));
}
