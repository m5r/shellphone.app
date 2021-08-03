import { Document, Html, DocumentHead, Main, BlitzScript, Head /*DocumentContext*/ } from "blitz";

class MyDocument extends Document {
	// Only uncomment if you need to customize this behaviour
	// static async getInitialProps(ctx: DocumentContext) {
	//   const initialProps = await Document.getInitialProps(ctx)
	//   return {...initialProps}
	// }

	render() {
		return (
			<Html lang="en">
				<DocumentHead />
				<Head>
					<link rel="manifest" href="/manifest.webmanifest" />

					<meta name="mobile-web-app-capable" content="yes" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta name="application-name" content="Shellphone" />
					<meta name="apple-mobile-web-app-title" content="Shellphone" />
					<meta name="theme-color" content="#663399" />
					<meta name="msapplication-navbutton-color" content="#663399" />
					<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
					<meta name="msapplication-starturl" content="/" />
					<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
				</Head>
				<body>
					<Main />
					<BlitzScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
