import type { BlitzPage } from "blitz";

import Layout from "../components/layout";

const Features: BlitzPage = () => {
	return <div>Coming soon! Please come back later &#128075;</div>;
};

Features.getLayout = (page) => <Layout title="Features">{page}</Layout>;
Features.suppressFirstRenderFlicker = true;

export default Features;
