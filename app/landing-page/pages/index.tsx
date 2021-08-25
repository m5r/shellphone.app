import { Suspense } from "react";
import type { BlitzPage } from "blitz";
import { Head, Link, useMutation, Routes } from "blitz";

import BaseLayout from "../../core/layouts/base-layout";
import logout from "../../auth/mutations/logout";
import useCurrentUser from "../../core/hooks/use-current-user";
import Header from "../components/header";

import "../styles/index.css";

const LandingPage: BlitzPage = () => {
	return (
		<>
			<Head>
				<title>Shellphone: Your Personal Cloud Phone</title>

				<link
					rel="preload"
					href="/fonts/P22MackinacPro-Book.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
				<link
					rel="preload"
					href="/fonts/P22MackinacPro-Bold.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
				<link
					rel="preload"
					href="/fonts/P22MackinacPro-ExtraBold.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
				<link
					rel="preload"
					href="/fonts/P22MackinacPro-Medium.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
			</Head>
			<section className="font-inter antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 tracking-tight">
				<Header />
			</section>
		</>
	);
};

LandingPage.suppressFirstRenderFlicker = true;

export default LandingPage;
