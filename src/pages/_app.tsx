import { useRef } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";

import { pageTitle } from "./_document";
import { SessionProvider } from "../session-context";

import "../fonts.css";
import "../tailwind.css";

const NextApp = (props: AppProps) => {
	const queryClientRef = useRef<QueryClient>();
	if (!queryClientRef.current) {
		queryClientRef.current = new QueryClient();
	}

	const { Component, pageProps } = props;

	return (
		<QueryClientProvider client={queryClientRef.current}>
			<Hydrate state={pageProps.dehydratedState}>
				<SessionProvider user={pageProps.user}>
					<Head>
						<meta
							name="viewport"
							content="width=device-width, initial-scale=1"
						/>
						<title>{pageTitle}</title>
					</Head>
					<Component {...pageProps} />
				</SessionProvider>
			</Hydrate>
		</QueryClientProvider>
	);
};

export default NextApp;
