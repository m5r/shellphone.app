/**
 * @type {import("@remix-run/dev").AppConfig}
 */
module.exports = {
	serverBuildTarget: "node-cjs",
	serverDependenciesToBundle: ["@headlessui/react"],
	devServerPort: 8002,
};
