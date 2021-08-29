import type { BlitzPage } from "blitz";

import Layout from "../../public-area/components/layout";

const Blog: BlitzPage = () => {
	return <article className="m-auto">Coming soon.</article>;
};

Blog.getLayout = (page) => <Layout title="Blog">{page}</Layout>;
Blog.suppressFirstRenderFlicker = true;

export default Blog;
