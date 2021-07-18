import Document, { Html, Head, Main, NextScript } from "next/document";

export const pageTitle = "My Serverless App";
const defaultDescription = "My app, freshly generated by FSS";
const defaultOGURL = "";
const defaultOGImage = "";

class NextDocument extends Document {
	public render() {
		return (
			<Html lang="en">
				<Head>
					<meta charSet="UTF-8" />
					<meta name="description" content={defaultDescription} />
					<link
						rel="icon"
						sizes="192x192"
						href="/static/touch-icon.png"
					/>
					<link
						rel="apple-touch-icon"
						href="/static/touch-icon.png"
					/>
					<link
						rel="mask-icon"
						href="/static/favicon-mask.svg"
						color="#49B882"
					/>
					<link rel="icon" href="/static/favicon.ico" />
					<meta property="og:url" content={defaultOGURL} />
					<meta property="og:title" content={pageTitle} />
					<meta
						property="og:description"
						content={defaultDescription}
					/>
					<meta name="twitter:site" content={defaultOGURL} />
					<meta name="twitter:card" content="summary_large_image" />
					<meta name="twitter:image" content={defaultOGImage} />
					<meta property="og:image" content={defaultOGImage} />
					<meta property="og:image:width" content="1200" />
					<meta property="og:image:height" content="630" />

					<link
						rel="preload"
						as="font"
						type="font/woff2"
						crossOrigin="anonymous"
						href="/static/fonts/inter/Inter-roman.var.woff2"
					/>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default NextDocument;
