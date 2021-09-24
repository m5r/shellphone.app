import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import type { BlitzPage } from "blitz";
import { Routes } from "blitz";
import { atom, useAtom } from "jotai";

import Layout from "../../core/layouts/layout";
import ConversationsList from "../components/conversations-list";
import NewMessageButton from "../components/new-message-button";
import useRequireOnboarding from "../../core/hooks/use-require-onboarding";
import useNotifications from "../../core/hooks/use-notifications";

const Messages: BlitzPage = () => {
	useRequireOnboarding();
	const { subscription, subscribe } = useNotifications();
	const setIsOpen = useAtom(bottomSheetOpenAtom)[1];

	useEffect(() => {
		if (!subscription) {
			subscribe();
		}
	}, [subscribe, subscription]);

	return (
		<>
			<div className="flex flex-col space-y-6 p-3">
				<h2 className="text-3xl font-bold">Messages</h2>
			</div>
			<section className="flex flex-grow flex-col">
				<Suspense fallback="Loading...">
					<ConversationsList />
				</Suspense>
			</section>
			<NewMessageButton onClick={() => setIsOpen(true)} />
			<NewMessageBottomSheet />
		</>
	);
};

const NewMessageBottomSheet = dynamic(() => import("../components/new-message-bottom-sheet"), {
	ssr: false,
	loading: () => null,
});

export const bottomSheetOpenAtom = atom(false);

Messages.getLayout = (page) => <Layout title="Messages">{page}</Layout>;

Messages.authenticate = { redirectTo: Routes.SignIn().pathname };

export default Messages;
