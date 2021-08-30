import { Link, Routes } from "blitz";

import type { Post } from "../../../integrations/datocms";
import { formatDate } from "../../core/helpers/date-formatter";

import PostPreview from "./post-preview";

type Props = {
	posts: Post[];
};

export default function MoreStories({ posts }: Props) {
	return (
		<aside>
			<div className="relative max-w-6xl mx-auto px-4 sm:px-6">
				<div className="pb-12 md:pb-20">
					<div className="max-w-3xl mx-auto">
						<h4 className="h4 font-mackinac mb-8">Related articles</h4>

						{/* Articles container */}
						<div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
							{posts.map((post) => (
								<article key={post.slug} className="relative group p-6 text-white">
									<figure>
										<img
											className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-75 transition duration-700 ease-out"
											src={post.coverImage.responsiveImage.src}
											width="372"
											height="182"
											alt="Related post"
										/>
										<div
											className="absolute inset-0 bg-primary-500 opacity-75 group-hover:opacity-50 transition duration-700 ease-out"
											aria-hidden="true"
										/>
									</figure>
									<div className="relative flex flex-col h-full">
										<header className="flex-grow">
											<Link href={Routes.PostPage({ slug: post.slug })}>
												<a className="hover:underline">
													<h3 className="text-lg font-mackinac font-bold tracking-tight mb-2">
														{post.title}
													</h3>
												</a>
											</Link>
											<div className="text-sm opacity-80">{formatDate(new Date(post.date))}</div>
										</header>
										<footer>
											{/* Author meta */}
											<div className="flex items-center text-sm mt-5">
												<a href="#0">
													<img
														className="rounded-full flex-shrink-0 mr-3"
														src={post.author.picture.url}
														width="32"
														height="32"
														alt={post.author.name}
													/>
												</a>
												<div>
													<span className="opacity-75">By </span>
													<span className="font-medium hover:underline">
														{post.author.name}
													</span>
												</div>
											</div>
										</footer>
									</div>
								</article>
							))}
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
}
