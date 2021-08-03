import { getConfig } from "blitz";
import { remark } from "remark";
import html from "remark-html";

export async function markdownToHtml(markdown: string) {
	const result = await remark().use(html).process(markdown);
	return result.toString();
}

const { serverRuntimeConfig } = getConfig();

// See: https://www.datocms.com/blog/offer-responsive-progressive-lqip-images-in-2020
const responsiveImageFragment = `
  fragment responsiveImageFragment on ResponsiveImage {
  srcSet
    webpSrcSet
    sizes
    src
    width
    height
    aspectRatio
    alt
    title
    bgColor
    base64
  }
`;

type Params = {
	variables?: Record<string, string>;
	preview?: boolean;
};

async function fetchAPI<Response = unknown>(query: string, { variables, preview }: Params = {}) {
	const res = await fetch("https://graphql.datocms.com" + (preview ? "/preview" : ""), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${serverRuntimeConfig.datoCms.apiToken}`,
		},
		body: JSON.stringify({
			query,
			variables,
		}),
	});

	const json = await res.json();
	if (json.errors) {
		console.error(json.errors);
		throw new Error("Failed to fetch API");
	}
	return json.data as Response;
}

export type Post = {
	slug: string;
	title: string;
	excerpt: string;
	date: string; // "YYYY-MM-DD"
	content: string;
	ogImage: {
		url: string;
	};
	coverImage: {
		responsiveImage: {
			srcSet: string;
			webpSrcSet: string;
			sizes: string;
			src: string;
			width: 2000;
			height: 1000;
			aspectRatio: 2;
			alt: string | null;
			title: string | null;
			bgColor: string | null;
			base64: string;
		};
	};
	author: {
		name: string;
		picture: {
			url: string;
		};
	};
};

export async function getPreviewPostBySlug(slug: string) {
	const data = await fetchAPI<{ post: Pick<Post, "slug"> } | null>(
		`
    query PostBySlug($slug: String) {
      post(filter: {slug: {eq: $slug}}) {
        slug
      }
    }`,
		{
			preview: true,
			variables: {
				slug,
			},
		},
	);
	return data?.post;
}

export async function getAllPostsWithSlug() {
	const { allPosts } = await fetchAPI<{ allPosts: Pick<Post, "slug">[] }>(`
    {
      allPosts {
        slug
      }
    }
  `);
	return allPosts;
}

export async function getAllPostsForHome(preview: boolean) {
	const data = await fetchAPI<{ allPosts: Omit<Post, "content" | "ogImage">[] }>(
		`
    {
      allPosts(orderBy: date_DESC, first: 20) {
        title
        slug
        excerpt
        date
        coverImage {
          responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 }) {
            ...responsiveImageFragment
          }
        }
        author {
          name
          picture {
            url(imgixParams: {fm: jpg, fit: crop, w: 100, h: 100, sat: -100})
          }
        }
      }
    }
    ${responsiveImageFragment}
  `,
		{ preview },
	);
	return data?.allPosts;
}

export async function getPostAndMorePosts(slug: string, preview: boolean) {
	return fetchAPI<{ post: Omit<Post, "excerpt">; morePosts: Omit<Post, "content" | "ogImage">[] }>(
		`
  query PostBySlug($slug: String) {
    post(filter: {slug: {eq: $slug}}) {
      title
      slug
      content
      date
      ogImage: coverImage{
        url(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 })
      }
      coverImage {
        responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 }) {
          ...responsiveImageFragment
        }
      }
      author {
        name
        picture {
          url(imgixParams: {fm: jpg, fit: crop, w: 100, h: 100, sat: -100})
        }
      }
    }
    morePosts: allPosts(orderBy: date_DESC, first: 2, filter: {slug: {neq: $slug}}) {
      title
      slug
      excerpt
      date
      coverImage {
        responsiveImage(imgixParams: {fm: jpg, fit: crop, w: 2000, h: 1000 }) {
          ...responsiveImageFragment
        }
      }
      author {
        name
        picture {
          url(imgixParams: {fm: jpg, fit: crop, w: 100, h: 100, sat: -100})
        }
      }
    }
  }
  ${responsiveImageFragment}
  `,
		{
			preview,
			variables: {
				slug,
			},
		},
	);
}
