import { Link, useQuery, Routes } from "blitz";
import { DateTime } from "luxon";
import { faChevronRight } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import getConversationsQuery from "../queries/get-conversations";

export default function ConversationsList() {
	const conversations = useQuery(getConversationsQuery, {})[0];

	if (Object.keys(conversations).length === 0) {
		return <div>empty state</div>;
	}

	return (
		<ul className="divide-y">
			{Object.values(conversations).map(({ recipient, formattedPhoneNumber, messages }) => {
				const lastMessage = messages[messages.length - 1]!;
				return (
					<li key={recipient} className="py-2 p-4">
						<Link href={Routes.ConversationPage({ recipient })}>
							<a className="flex flex-col">
								<div className="flex flex-row justify-between">
									<strong>{formattedPhoneNumber}</strong>
									<div className="text-gray-700 flex flex-row gap-x-1">
										{formatMessageDate(lastMessage.sentAt)}
										<FontAwesomeIcon className="w-4 h-4 my-auto" icon={faChevronRight} />
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

function formatMessageDate(date: Date): string {
	const messageDate = DateTime.fromJSDate(date);
	const diff = messageDate.diffNow("days");

	const isToday = diff.days > -1;
	if (isToday) {
		return messageDate.toFormat("HH:mm", { locale: "en-US" });
	}

	const isDuringLastWeek = diff.days > -8;
	if (isDuringLastWeek) {
		return messageDate.weekdayLong;
	}

	return messageDate.toFormat("dd/MM/yyyy", { locale: "en-US" });
}
