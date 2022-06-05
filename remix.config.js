/**
 * @type {import("@remix-run/dev/config").AppConfig}
 */
module.exports = {
	serverBuildTarget: "node-cjs",
	serverDependenciesToBundle: ["@headlessui/react"],
	devServerPort: 8002,
};
