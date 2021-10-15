import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import type { BlitzPage } from "blitz";
import { Routes } from "blitz";
import { atom, useAtom } from "jotai";

import Layout from "app/core/layouts/layout";
import ConversationsList from "../components/conversations-list";
import NewMessageButton from "../components/new-message-button";
import MissingTwilioCredentials from "app/core/components/missing-twilio-credentials";
import useNotifications from "app/core/hooks/use-notifications";
import useCurrentUser from "app/core/hooks/use-current-user";
import PageTitle from "../../core/components/page-title";

const Messages: BlitzPage = () => {
	const { hasFilledTwilioCredentials } = useCurrentUser();
	const { subscription, subscribe } = useNotifications();
	const setIsOpen = useAtom(bottomSheetOpenAtom)[1];

	useEffect(() => {
		if (!subscription) {
			subscribe();
		}
	}, [subscribe, subscription]);

	if (!hasFilledTwilioCredentials) {
		return (
			<>
				<MissingTwilioCredentials />
				<PageTitle className="filter blur-sm absolute top-0" title="Messages" />
			</>
		);
	}

	return (
		<>
			<PageTitle title="Messages" />
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
