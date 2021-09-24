import { Link, useQuery, Routes } from "blitz";
import { IoChevronForward } from "react-icons/io5";

import getConversationsQuery from "../queries/get-conversations";
import { formatRelativeDate } from "../../core/helpers/date-formatter";
import { useEffect } from "react";
import PhoneInitLoader from "../../core/components/phone-init-loader";
import EmptyMessages from "./empty-messages";

export default function ConversationsList() {
	const [conversations, query] = useQuery(getConversationsQuery, {});

	useEffect(() => {
		if (!conversations) {
			const pollInterval = setInterval(() => query.refetch(), 1500);
			return () => clearInterval(pollInterval);
		}
	}, [conversations, query]);

	if (!conversations) {
		// we're still importing messages from twilio
		return <PhoneInitLoader />;
	}

	if (Object.keys(conversations).length === 0) {
		return <EmptyMessages />;
	}

	return (
		<ul className="divide-y">
			{Object.values(conversations).map(({ recipient, formattedPhoneNumber, messages }) => {
				const lastMessage = messages[messages.length - 1]!;
				return (
					<li key={`sms-conversation-${recipient}`} className="py-2 px-4">
						<Link href={Routes.ConversationPage({ recipient })}>
							<a className="flex flex-col">
								<div className="flex flex-row justify-between">
									<strong>{formattedPhoneNumber}</strong>
									<div className="text-gray-700 flex flex-row gap-x-1">
										{formatRelativeDate(lastMessage.sentAt)}
										<IoChevronForward className="w-4 h-4 my-auto" />
									</div>
								</div>
								<div className="line-clamp-2 text-gray-700">{lastMessage.content}</div>
							</a>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
