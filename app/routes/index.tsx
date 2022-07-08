import type { LinksFunction, MetaFunction } from "@remix-run/node";

import joinWaitlistAction from "~/features/public-area/actions/index";
import IndexPage from "~/features/public-area/pages/index";
import { getSeoMeta } from "~/utils/seo";

import styles from "../styles/index.css";

export const action = joinWaitlistAction;

export const meta: MetaFunction = () => ({
	...getSeoMeta({ title: "", description: "Welcome to Remixtape!" }),
});

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

export default IndexPage;
