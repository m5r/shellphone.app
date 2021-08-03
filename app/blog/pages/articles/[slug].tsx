import { BlitzPage, GetStaticPaths, GetStaticProps, Head, useRouter } from "blitz";
import ErrorPage from "next/error";

import type { Post } from "integrations/datocms";
import { getAllPostsWithSlug, getPostAndMorePosts } from "integrations/datocms";

type Props = {
	post: Post;
	morePosts: Post[];
	preview: boolean;
};

const PostPage: BlitzPage<Props> = ({ post, morePosts, preview }) => {
	const router = useRouter();
	if (!router.isFallback && !post?.slug) {
		return <ErrorPage statusCode={404} />;
	}

	console.log("post", post);

	// TODO
	/*return (
		<Layout preview={preview}>
			<Container>
				<Header />
				{router.isFallback ? (
					<PostTitle>Loading…</PostTitle>
				) : (
					<>
						<article>
							<Head>
								<title>
									{post.title} | Next.js Blog Example with {CMS_NAME}
								</title>
								<meta property="og:image" content={post.ogImage.url} />
							</Head>
							<PostHeader
								title={post.title}
								coverImage={post.coverImage}
								date={post.date}
								author={post.author}
							/>
							<PostBody content={post.content} />
						</article>
						<SectionSeparator />
						{morePosts.length > 0 && <MoreStories posts={morePosts} />}
					</>
				)}
			</Container>
		</Layout>
	);*/

	return null;
};

export default PostPage;

export const getStaticProps: GetStaticProps = async ({ params, preview = false }) => {
	if (!params || !params.slug || Array.isArray(params.slug)) {
		return {
			notFound: true,
		};
	}

	const data = await getPostAndMorePosts(params.slug, preview);
	const content = /*await markdownToHtml(data.post.content || "");*/ "";

	return {
		props: {
			preview,
			post: {
				...data.post,
				content,
			},
			morePosts: data.morePosts,
		},
	};
};

export const getStaticPaths: GetStaticPaths = async () => {
	const allPosts = await getAllPostsWithSlug();
	return {
		paths: allPosts.map((post) => `/articles/${post.slug}`),
		fallback: true,
	};
};
