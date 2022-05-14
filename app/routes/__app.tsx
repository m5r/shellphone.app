import { type LoaderFunction, json } from "@remix-run/node";
import { Outlet, useCatch, useMatches } from "@remix-run/react";

import { type SessionData, type SessionOrganization, requireLoggedIn } from "~/utils/auth.server";
import Footer from "~/features/core/components/footer";
import db from "~/utils/db.server";

export type AppLoaderData = SessionData

export const loader:LoaderFunction = async ({ request }) => {
	const user = await requireLoggedIn(request);
	const organization = await db.organization.findUnique({
		where: { id: user.organizations[0].id },
		include: {
			memberships: {
				where: { userId: user.id },
				select: { role: true },
			},
		},
	});
	const currentOrganization: SessionOrganization = {
		id: organization!.id,
		twilioAccountSid: organization!.twilioAccountSid,
		role: organization!.memberships[0].role,
	};

	return json<AppLoaderData>({ ...user, currentOrganization });
}

export default function __App() {
	const hideFooter = false;
	const matches = useMatches();
	// matches[0].handle
	// console.log("matches", matches);

	return (
		<div className="h-full w-full overflow-hidden fixed bg-gray-100">
			<div className="flex flex-col w-full h-full">
				<div className="flex flex-col flex-1 w-full overflow-y-auto">
					<main className="flex flex-col flex-1 my-0 h-full">
						<Outlet />
					</main>
				</div>
				{!hideFooter ? <Footer /> : null}
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
					<main className="flex flex-col flex-1 my-0 h-full">
						{caught.status}
					</main>
				</div>
				<Footer />
			</div>
		</div>
	);
}
