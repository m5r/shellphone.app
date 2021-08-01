import { Suspense, useState } from "react";
import type { BlitzPage } from "blitz";
import { Routes } from "blitz";
import { useAtom } from "jotai";

import Layout from "../../core/layouts/layout";
import ConversationsList from "../components/conversations-list";
import NewMessageButton from "../components/new-message-button";
import NewMessageBottomSheet, { bottomSheetOpenAtom } from "../components/new-message-bottom-sheet";
import useRequireOnboarding from "../../core/hooks/use-require-onboarding";

const Messages: BlitzPage = () => {
	useRequireOnboarding();
	const setIsOpen = useAtom(bottomSheetOpenAtom)[1];

	return (
		<>
			<div className="flex flex-col space-y-6 p-6">
				<h2 className="text-3xl font-bold">Messages</h2>
			</div>
			<Suspense fallback="Loading...">
				<ConversationsList />
			</Suspense>
			<NewMessageButton onClick={() => setIsOpen(true)} />
			<NewMessageBottomSheet />
		</>
	);
};

Messages.getLayout = (page) => <Layout title="Messages">{page}</Layout>;

Messages.authenticate = { redirectTo: Routes.SignIn().pathname };

export default Messages;
