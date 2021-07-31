import { Suspense, useEffect, useRef } from "react";
import { useRouter } from "blitz";
import clsx from "clsx";

import { Direction } from "../../../db";
import useConversation from "../hooks/use-conversation";
import NewMessageArea from "./new-message-area";

export default function Conversation() {
	const router = useRouter();
	const conversation = useConversation(router.params.recipient)[0];
	const messagesListRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		messagesListRef.current?.querySelector("li:last-child")?.scrollIntoView();
	}, [conversation, messagesListRef]);

	return (
		<>
			<div className="flex flex-col space-y-6 p-6 pt-12 pb-16">
				<ul ref={messagesListRef}>
					{conversation.map((message, index) => {
						const isOutbound = message.direction === Direction.Outbound;
						const nextMessage = conversation![index + 1];
						const previousMessage = conversation![index - 1];
						const isSameNext = message.from === nextMessage?.from;
						const isSamePrevious = message.from === previousMessage?.from;
						const differenceInMinutes = previousMessage
							? (new Date(message.sentAt).getTime() -
									new Date(previousMessage.sentAt).getTime()) /
							  1000 /
							  60
							: 0;
						const isTooLate = differenceInMinutes > 15;
						return (
							<li key={message.id}>
								{(!isSamePrevious || isTooLate) && (
									<div className="flex py-2 space-x-1 text-xs justify-center">
										<strong>
											{new Date(message.sentAt).toLocaleDateString("fr-FR", {
												weekday: "long",
												day: "2-digit",
												month: "short",
											})}
										</strong>
										<span>
											{new Date(message.sentAt).toLocaleTimeString("fr-FR", {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									</div>
								)}

								<div
									className={clsx(
										isSameNext ? "pb-1" : "pb-2",
										isOutbound ? "text-right" : "text-left"
									)}
								>
									<span
										className={clsx(
											"inline-block text-left w-[fit-content] p-2 rounded-lg text-white",
											isOutbound
												? "bg-[#3194ff] rounded-br-none"
												: "bg-black rounded-bl-none"
										)}
									>
										{message.content}
									</span>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
			<Suspense fallback={null}>
				<NewMessageArea />
			</Suspense>
		</>
	);
}
