const fs = require("node:fs");
const path = require("node:path");
const glob = require("glob");
const esbuild = require("esbuild");

const isDev = process.env.NODE_ENV !== "production";
const basePath = process.cwd();
const args = process.argv.slice(2);
const watch = args.includes("--watch");

const cacheVersion = isDev
	? "dev"
	: (() => {
			const manifests = glob.sync(path.join(basePath, "/public/build/manifest-*.js"));
			const manifest = manifests.reduce((mostRecent, manifest) =>
				fs.statSync(manifest).mtime > fs.statSync(mostRecent).mtime ? manifest : mostRecent,
			);
			return manifest.match(/manifest-(\w+).js/)[1].toLowerCase();
	  })();

esbuild
	.build({
		write: true,
		outfile: path.join(basePath, "public", "entry.worker.js"),
		entryPoints: [path.join(basePath, "app", "entry.worker.ts")],
		format: "esm",
		bundle: true,
		define: {
			ASSET_CACHE: `"asset-cache_${cacheVersion}"`,
			DATA_CACHE: `"data-cache_${cacheVersion}"`,
			DOCUMENT_CACHE: `"document-cache_${cacheVersion}"`,
		},
		watch: watch
			? {
					onRebuild(error, buildResult) {
						const warnings = error?.warnings || buildResult?.warnings;
						const errors = error?.errors || buildResult?.errors;
						if (warnings.length) {
							console.log(esbuild.formatMessages(warnings, { kind: "warning" }));
						}
						if (errors.length) {
							console.log(esbuild.formatMessages(errors, { kind: "error" }));

							process.exit(1);
						}

						console.log("Service worker rebuilt successfully");
					},
			  }
			: false,
	})
	.then(({ errors, warnings }) => {
		if (warnings.length) {
			console.log(esbuild.formatMessages(warnings, { kind: "warning" }));
		}
		if (errors.length) {
			console.log(esbuild.formatMessages(errors, { kind: "error" }));

			process.exit(1);
		}

		console.log("Service worker build succeeded");
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
