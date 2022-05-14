import type { LinksFunction, MetaFunction } from "@remix-run/node";

import IndexPage from "~/features/public-area/pages";
import { getSeoMeta } from "~/utils/seo";

import styles from "../styles/index.css";

export const meta: MetaFunction = () => ({
	...getSeoMeta({ title: "", description: "Welcome to Remixtape!" }),
});

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default IndexPage;
