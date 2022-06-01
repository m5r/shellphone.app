declare let self: ServiceWorkerGlobalScope;

export default async function handleInstall(event: ExtendableEvent) {
	console.debug("Service worker installed");
}
