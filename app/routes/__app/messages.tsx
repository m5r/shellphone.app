import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "superjson-remix";
import { atom, useAtom } from "jotai";

import messagesLoader, { type MessagesLoaderData } from "~/features/messages/loaders/messages";
import PageTitle from "~/features/core/components/page-title";
import MissingTwilioCredentials from "~/features/core/components/missing-twilio-credentials";
import ConversationsList from "~/features/messages/components/conversations-list";
import NewMessageButton from "~/features/messages/components/new-message-button";
import NewMessageBottomSheet from "~/features/messages/components/new-message-bottom-sheet";
import { getSeoMeta } from "~/utils/seo";

export const meta: MetaFunction = () => ({
	...getSeoMeta({ title: "Messages" }),
});

export const loader = messagesLoader;

export default function MessagesPage() {
	const { hasPhoneNumber } = useLoaderData<MessagesLoaderData>();
	const setIsNewMessageSheetOpen = useAtom(bottomSheetOpenAtom)[1];

	if (!hasPhoneNumber) {
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
				<ConversationsList />
			</section>
			<NewMessageButton onClick={() => setIsNewMessageSheetOpen(true)} />
			<NewMessageBottomSheet />
		</>
	);
}

export const bottomSheetOpenAtom = atom(false);
