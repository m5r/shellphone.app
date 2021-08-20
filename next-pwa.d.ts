import type { BlitzConfig } from "blitz";

declare module "next-pwa" {
	function withPWA(config: BlitzConfig): BlitzConfig;

	export default withPWA;
}
