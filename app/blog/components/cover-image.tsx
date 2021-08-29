import { Image } from "react-datocms";
import clsx from "clsx";
import Link from "next/link";

export default function CoverImage({ title, responsiveImage, slug }: any) {
	const image = (
		// eslint-disable-next-line jsx-a11y/alt-text
		<Image
			data={{
				...responsiveImage,
				alt: `Cover Image for ${title}`,
			}}
			className={clsx("shadow-small", {
				"hover:shadow-medium transition-shadow duration-200": slug,
			})}
		/>
	);
	return (
		<div className="sm:mx-0">
			{slug ? (
				<Link href={`/posts/${slug}`}>
					<a aria-label={title}>{image}</a>
				</Link>
			) : (
				image
			)}
		</div>
	);
}
