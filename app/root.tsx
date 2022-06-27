import type { FunctionComponent, PropsWithChildren } from "react";
import { type LinksFunction, type LoaderFunction, json } from "@remix-run/node";
import {
	Link,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
	useLoaderData,
} from "@remix-run/react";

import config from "~/config/config.server";
import usePanelbear from "~/features/core/hooks/use-panelbear";
import Logo from "~/features/core/components/logo";

import styles from "./styles/tailwind.css";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

type LoaderData = {
	shellphoneConfig: {
		sentry: {
			dsn: string;
		};
		panelbear: {
			siteId: string;
		};
	};
};
export const loader: LoaderFunction = () => {
	return json<LoaderData>({
		shellphoneConfig: {
			sentry: {
				dsn: config.sentry.dsn,
			},
			panelbear: {
				siteId: config.panelBear.siteId,
			},
		},
	});
};

export default function App() {
	const { shellphoneConfig } = useLoaderData<LoaderData>();
	usePanelbear(shellphoneConfig.panelbear.siteId);
	return (
		<Document>
			<Outlet />
			<script
				suppressHydrationWarning
				dangerouslySetInnerHTML={{
					__html: `window.shellphoneConfig=${JSON.stringify(shellphoneConfig)};`,
				}}
			/>
		</Document>
	);
}

// https://remix.run/docs/en/v1/api/conventions#errorboundary
export function ErrorBoundary({ error }: { error: Error }) {
	console.error(error);
	return (
		<Document>
			<div>
				<h1>There was an error</h1>
				<p>{error.message}</p>
			</div>
		</Document>
	);
}

// https://remix.run/docs/en/v1/api/conventions#catchboundary
export function CatchBoundary() {
	const caught = useCatch();

	let message;
	switch (caught.status) {
		case 401:
			message = <p>Oops! Looks like you tried to visit a page that you do not have access to.</p>;
			break;
		case 404:
			message = <p>Oops! Looks like you tried to visit a page that does not exist.</p>;
			break;
		default:
			throw new Error(caught.data || caught.statusText);
	}

	return (
		<Document>
			<header>
				<Link to="/">
					<div className="p-4">
						<Logo className="w-8" />
					</div>
				</Link>
			</header>
			<main>
				<h1>
					{caught.status}: {caught.statusText}
				</h1>
				{message}
			</main>
		</Document>
	);
}

const Document: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => (
	<html lang="en" className="h-full">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />

			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-title" content="Shellphone" />
			<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

			<meta name="mobile-web-app-capable" content="yes" />
			<meta name="application-name" content="Shellphone" />
			<meta name="theme-color" content="#F4F4F5" />

			<meta name="msapplication-navbutton-color" content="#F4F4F5" />
			<meta name="msapplication-starturl" content="/messages" />
			<meta name="msapplication-TileColor" content="#F4F4F5" />

			<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
			<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
			<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
			<link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#F4F4F5" />
			<link rel="manifest" href="/manifest.webmanifest" />
			<Meta />
			<Links />
		</head>
		<body className="h-full">
			{children}
			<ScrollRestoration />
			<script async data-api="/_hive" src="/bee.js" />
			<Scripts />
			<LiveReload />
		</body>
	</html>
);
