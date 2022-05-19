import { useLoaderData } from "superjson-remix";

import messagesLoader, { type MessagesLoaderData } from "~/features/messages/loaders/messages";
import PageTitle from "~/features/core/components/page-title";
import MissingTwilioCredentials from "~/features/core/components/missing-twilio-credentials";
import ConversationsList from "~/features/messages/components/conversations-list";
import NewMessageButton from "~/features/messages/components/new-message-button";

export const loader = messagesLoader;

export default function MessagesPage() {
	const { user } = useLoaderData<MessagesLoaderData>();

	if (!user.hasPhoneNumber) {
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
		</>
	);
}
