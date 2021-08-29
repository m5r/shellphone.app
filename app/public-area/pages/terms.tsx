import type { BlitzPage } from "blitz";

import Layout from "../components/layout";

const TermsOfService: BlitzPage = () => {
	return <article className="m-auto">Coming soon.</article>;
};

TermsOfService.getLayout = (page) => <Layout title="Terms of Service">{page}</Layout>;
TermsOfService.suppressFirstRenderFlicker = true;

export default TermsOfService;
