const path = require("path");
const esbuild = require("esbuild");
const { nodeExternalsPlugin } = require("esbuild-node-externals");

const basePath = process.cwd();
const args = process.argv.slice(2);
const watch = args.includes("--watch");

esbuild
	.build({
		write: true,
		outfile: path.join(basePath, "server/index.js"),
		entryPoints: [path.join(basePath, "server/index.ts")],
		platform: "node",
		format: "cjs",
		bundle: true,
		sourcemap: "inline",
		plugins: [
			nodeExternalsPlugin({ packagePath: path.join(basePath, "package.json") }),
			{
				name: "remix-bundle-external",
				setup(build) {
					build.onResolve({ filter: /^\.\.\/build$/ }, () => ({ external: true }));
				},
			},
		],
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

						console.log("Server rebuilt successfully");
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

		console.log("Server build succeeded");
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
