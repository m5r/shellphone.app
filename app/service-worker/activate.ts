import { deleteCaches } from "./cache-utils";

declare let self: ServiceWorkerGlobalScope;

export default async function handleActivate(event: ExtendableEvent) {
	console.debug("Service worker activated");
	// @ts-ignore
	if (self.registration.navigationPreload) {
		// @ts-ignore
		await self.registration.navigationPreload.enable();
	}

	await deleteCaches(); // TODO: maybe wait for the user to reload before busting the cache
}
