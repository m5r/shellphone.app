export function purgeRequireCache() {
	const resolved = require.resolve("../build");
	for (const key in require.cache) {
		if (key.startsWith(resolved)) {
			delete require.cache[key];
		}
	}
}
