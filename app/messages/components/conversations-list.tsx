import { Link, useQuery } from "blitz";

import getConversationsQuery from "../queries/get-conversations";

export default function ConversationsList() {
	const conversations = useQuery(getConversationsQuery, {})[0];

	if (Object.keys(conversations).length === 0) {
		return <div>empty state</div>;
	}

	return (
		<ul className="divide-y">
			{Object.entries(conversations).map(([recipient, messages]) => {
				const lastMessage = messages[messages.length - 1]!;
				return (
					<li key={recipient} className="py-2">
						<Link href={`/messages/${encodeURIComponent(recipient)}`}>
							<a className="flex flex-col">
								<div className="flex flex-row justify-between">
									<strong>{recipient}</strong>
									<div>
										{new Date(lastMessage.sentAt).toLocaleString("fr-FR")}
									</div>
								</div>
								<div>{lastMessage.content}</div>
							</a>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
