import type { BlitzPage } from "blitz";

import Layout from "../components/layout";

const PrivacyPolicy: BlitzPage = () => {
	return <article className="m-auto">Coming soon.</article>;
};

PrivacyPolicy.getLayout = (page) => <Layout title="Privacy Policy">{page}</Layout>;
PrivacyPolicy.suppressFirstRenderFlicker = true;

export default PrivacyPolicy;
