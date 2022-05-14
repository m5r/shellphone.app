import type { FunctionComponent, ReactNode } from "react";
import type { LinksFunction } from "@remix-run/node";
import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from "@remix-run/react";

import Logo from "~/features/core/components/logo";

import styles from "./styles/tailwind.css";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: styles },
	{
		rel: "icon",
		href: "/favicon.ico",
	},
	{
		rel: "apple-touch-icon",
		sizes: "180x180",
		href: "/apple-touch-icon.png",
	},
	{
		rel: "icon",
		type: "image/png",
		sizes: "32x32",
		href: "/favicon-32x32.png",
	},
	{
		rel: "icon",
		type: "image/png",
		sizes: "16x16",
		href: "/favicon-16x16.png",
	},
	{
		rel: "mask-icon",
		href: "/safari-pinned-tab.svg",
		color: "#663399",
	},
];

export default function App() {
	return (
		<Document>
			<Outlet />
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

const Document: FunctionComponent<{ children: ReactNode }> = ({ children }) => (
	<html lang="en" className="h-full">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width,initial-scale=1" />
			<Meta />
			<Links />
		</head>
		<body className="h-full">
			{children}
			<ScrollRestoration />
			<Scripts />
			<LiveReload />
		</body>
	</html>
);
