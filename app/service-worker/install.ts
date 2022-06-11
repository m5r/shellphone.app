declare const self: ServiceWorkerGlobalScope;

export default async function handleInstall(event: ExtendableEvent) {
	console.debug("Service worker installed");
}
