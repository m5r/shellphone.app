import { type LinksFunction, type LoaderFunction, json } from "@remix-run/node";
import { Outlet, useCatch, useMatches } from "@remix-run/react";

import serverConfig from "~/config/config.server";
import { type SessionData, requireLoggedIn } from "~/utils/auth.server";
import Footer from "~/features/core/components/footer";
import useServiceWorkerRevalidate from "~/features/core/hooks/use-service-worker-revalidate";
import footerStyles from "~/features/core/components/footer.css";
import appStyles from "~/styles/app.css";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: appStyles },
	{ rel: "stylesheet", href: footerStyles },
];

export type AppLoaderData = {
	sessionData: SessionData;
	config: { webPushPublicKey: string };
};

export const loader: LoaderFunction = async ({ request }) => {
	const sessionData = await requireLoggedIn(request);

	return json<AppLoaderData>({
		sessionData,
		config: {
			webPushPublicKey: serverConfig.webPush.publicKey,
		},
	});
};

export default function __App() {
	useServiceWorkerRevalidate();
	const matches = useMatches();
	const hideFooter = matches.some((match) => match.handle?.hideFooter === true);

	return (
		<div className="h-full w-full overflow-hidden fixed bg-gray-100">
			<div className="flex flex-col w-full h-full">
				<div className="flex flex-col flex-1 w-full overflow-y-auto">
					<main className="flex flex-col flex-1 my-0 h-full">
						<Outlet />
					</main>
				</div>
				{hideFooter ? null : <Footer />}
			</div>
		</div>
	);
}

export function CatchBoundary() {
	const caught = useCatch();
	console.log("caught", caught);

	return (
		<div className="h-full w-full overflow-hidden fixed bg-gray-100">
			<div className="flex flex-col w-full h-full">
				<div className="flex flex-col flex-1 w-full overflow-y-auto">
					<main className="flex flex-col flex-1 my-0 h-full">{caught.status}</main>
				</div>
				<Footer />
			</div>
		</div>
	);
}
