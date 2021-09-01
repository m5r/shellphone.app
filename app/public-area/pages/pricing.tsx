import type { BlitzPage } from "blitz";

import Layout from "../components/layout";

const Pricing: BlitzPage = () => {
	return <div>Coming soon! Please come back later &#128075;</div>;
};

Pricing.getLayout = (page) => <Layout title="Pricing">{page}</Layout>;
Pricing.suppressFirstRenderFlicker = true;

export default Pricing;
