import { Suspense } from "react";
import type { BlitzPage } from "blitz";
import { Routes } from "blitz";

import Layout from "../../core/layouts/layout";
import ConversationsList from "../components/conversations-list";
import useRequireOnboarding from "../../core/hooks/use-require-onboarding";

const Messages: BlitzPage = () => {
	useRequireOnboarding();

	return (
		<>
			<div className="flex flex-col space-y-6 p-6">
				<p>Messages page</p>
			</div>
			<Suspense fallback="Loading...">
				<ConversationsList />
			</Suspense>
		</>
	);
};

Messages.getLayout = (page) => <Layout title="Messages">{page}</Layout>;

Messages.authenticate = { redirectTo: Routes.SignIn() };

export default Messages;
