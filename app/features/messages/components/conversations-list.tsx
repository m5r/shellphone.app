import { Link } from "@remix-run/react";
import { useLoaderData } from "superjson-remix";
import { IoChevronForward } from "react-icons/io5";

import { formatRelativeDate } from "~/features/core/helpers/date-formatter";
import PhoneInitLoader from "~/features/core/components/phone-init-loader";
import EmptyMessages from "./empty-messages";
import type { MessagesLoaderData } from "~/features/messages/loaders/messages";

export default function ConversationsList() {
	const { conversations } = useLoaderData<MessagesLoaderData>();

	if (!conversations) {
		// we're still importing messages from twilio
		return <PhoneInitLoader />;
	}

	if (Object.keys(conversations).length === 0) {
		return <EmptyMessages />;
	}

	return (
		<ul className="divide-y">
			{Object.values(conversations).map(({ recipient, formattedPhoneNumber, lastMessage }) => {
				return (
					<li key={`sms-conversation-${recipient}`} className="py-2 px-4">
						<Link prefetch="intent" to={`/messages/${recipient}`} className="flex flex-col">
							<div className="flex flex-row justify-between">
								<span className="font-medium">{formattedPhoneNumber ?? recipient}</span>
								<div className="text-gray-700 flex flex-row gap-x-1">
									{formatRelativeDate(lastMessage.sentAt)}
									<IoChevronForward className="w-4 h-4 my-auto" />
								</div>
							</div>
							<div className="line-clamp-2 text-gray-700">{lastMessage.content}</div>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
