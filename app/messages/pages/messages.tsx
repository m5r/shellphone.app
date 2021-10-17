import { Suspense, useEffect } from "react";
import type { BlitzPage } from "blitz";
import { Routes, dynamic } from "blitz";
import { atom, useAtom } from "jotai";

import AppLayout from "app/core/layouts/layout";
import ConversationsList from "../components/conversations-list";
import NewMessageButton from "../components/new-message-button";
import MissingTwilioCredentials from "app/core/components/missing-twilio-credentials";
import useNotifications from "app/core/hooks/use-notifications";
import useCurrentUser from "app/core/hooks/use-current-user";
import PageTitle from "../../core/components/page-title";
import Spinner from "../../core/components/spinner";

const Messages: BlitzPage = () => {
	const { hasFilledTwilioCredentials, hasPhoneNumber } = useCurrentUser();
	const { subscription, subscribe } = useNotifications();
	const setIsOpen = useAtom(bottomSheetOpenAtom)[1];

	useEffect(() => {
		if (!subscription) {
			subscribe();
		}
	}, [subscribe, subscription]);

	if (!hasFilledTwilioCredentials || !hasPhoneNumber) {
		return (
			<>
				<MissingTwilioCredentials />
				<PageTitle className="filter blur-sm select-none absolute top-0" title="Messages" />
			</>
		);
	}

	return (
		<>
			<PageTitle title="Messages" />
			<section className="flex flex-grow flex-col">
				<Suspense fallback={<Spinner />}>
					{/* TODO: skeleton conversations list */}
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

Messages.getLayout = (page) => <AppLayout title="Messages">{page}</AppLayout>;

Messages.authenticate = { redirectTo: Routes.SignIn().pathname };

export default Messages;
