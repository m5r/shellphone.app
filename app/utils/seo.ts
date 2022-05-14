import { initSeo } from "remix-seo";

export const { getSeo, getSeoMeta, getSeoLinks } = initSeo({
	title: "",
	titleTemplate: "%s | Shellphone",
	description: "",
	defaultTitle: "Shellphone",
});
