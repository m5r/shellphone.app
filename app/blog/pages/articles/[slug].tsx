import type { BlitzPage, GetStaticPaths, GetStaticProps } from "blitz";
import { Head, useRouter } from "blitz";
import ErrorPage from "next/error";

import type { Post } from "integrations/datocms";
import { getAllPostsWithSlug, getPostAndMorePosts, markdownToHtml } from "integrations/datocms";
import Header from "../../../landing-page/components/header";
import PostBody from "../../components/post-body";
import SectionSeparator from "../../components/section-separator";
import MoreStories from "../../components/more-stories";

type Props = {
	post: Post;
	morePosts: Post[];
	preview: boolean;
};

const formatter = Intl.DateTimeFormat("en-US", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

const PostPage: BlitzPage<Props> = ({ post, morePosts, preview }) => {
	const router = useRouter();
	if (!router.isFallback && !post?.slug) {
		return <ErrorPage statusCode={404} />;
	}
	console.log("post", post);

	return (
		<div className="flex flex-col min-h-screen overflow-hidden">
			<Header />

			<main className="flex-grow">
				<section className="relative">
					{/* Background image */}
					<div className="absolute inset-0 h-128 pt-16 box-content">
						<img
							className="absolute inset-0 w-full h-full object-cover opacity-25"
							src={post.coverImage.responsiveImage.src}
							width={post.coverImage.responsiveImage.width}
							height={post.coverImage.responsiveImage.height}
							alt={post.coverImage.responsiveImage.alt ?? `${post.title} cover image`}
						/>
						<div
							className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900"
							aria-hidden="true"
						/>
					</div>

					<div className="relative max-w-6xl mx-auto px-4 sm:px-6">
						<div className="pt-32 pb-12 md:pt-40 md:pb-20">
							<div className="max-w-3xl mx-auto">
								<article>
									{/* Article header */}
									<header className="mb-8">
										{/* Title and excerpt */}
										<div className="text-center md:text-left">
											<h1 className="h1 font-mackinac mb-4">{post.title}</h1>
											<p className="text-xl text-gray-600 dark:text-gray-400">{post.excerpt}</p>
										</div>
										{/* Article meta */}
										<div className="md:flex md:items-center md:justify-between mt-5">
											{/* Author meta */}
											<div className="flex items-center justify-center">
												<img
													className="rounded-full flex-shrink-0 mr-3"
													src={post.author.picture.url}
													width="32"
													height="32"
													alt="Author 04"
												/>
												<div>
													<span className="text-gray-600 dark:text-gray-400">By </span>
													<a
														className="font-medium text-gray-800 dark:text-gray-300 hover:underline"
														href="#0"
													>
														{post.author.name}
													</a>
													<span className="text-gray-600 dark:text-gray-400">
														{" "}
														· {formatter.format(new Date(post.date))}
													</span>
												</div>
											</div>
										</div>
									</header>
									<hr className="w-5 h-px pt-px bg-gray-400 dark:bg-gray-500 border-0 mb-8" />

									{/* Article content */}
									<div className="text-lg text-gray-600 dark:text-gray-400">
										<PostBody content={post.content} />
									</div>
								</article>

								<SectionSeparator />
								{morePosts.length > 0 && <MoreStories posts={morePosts} />}
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);

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
};

export default PostPage;

export const getStaticProps: GetStaticProps = async ({ params, preview = false }) => {
	if (!params || !params.slug || Array.isArray(params.slug)) {
		return {
			notFound: true,
		};
	}

	const data = await getPostAndMorePosts(params.slug, preview);
	const content = await markdownToHtml(data.post.content || "");

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
