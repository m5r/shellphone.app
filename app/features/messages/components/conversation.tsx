import { useEffect, useRef } from "react";
import { useParams, useTransition } from "@remix-run/react";
import { useLoaderData } from "superjson-remix";
import clsx from "clsx";
import { Direction } from "@prisma/client";

import NewMessageArea from "./new-message-area";
import { formatDate, formatTime } from "~/features/core/helpers/date-formatter";
import { type ConversationLoaderData } from "~/features/messages/loaders/messages.$recipient";

export default function Conversation() {
	const params = useParams<{ recipient: string }>();
	const recipient = decodeURIComponent(params.recipient ?? "");
	const { conversation, currentPhoneNumber } = useLoaderData<ConversationLoaderData>();
	const transition = useTransition();
	const messagesListRef = useRef<HTMLUListElement>(null);

	const messages = conversation.messages;
	if (transition.submission) {
		messages.push({
			id: "temp",
			phoneNumberId: currentPhoneNumber!.id,
			from: currentPhoneNumber!.number,
			to: recipient,
			recipient,
			sentAt: new Date(),
			direction: Direction.Outbound,

			status: "Queued",
			content: transition.submission.formData.get("content")!.toString(),
		});
	}

	useEffect(() => {
		messagesListRef.current?.querySelector("li:last-child")?.scrollIntoView();
	}, [messages, messagesListRef]);

	return (
		<>
			<div className="flex flex-col space-y-6 p-6 pt-12 pb-16">
				<ul ref={messagesListRef}>
					{messages.length === 0 ? "empty state" : null}
					{messages.map((message, index) => {
						const isOutbound = message.direction === Direction.Outbound;
						const nextMessage = messages![index + 1];
						const previousMessage = messages![index - 1];
						const isNextMessageFromSameSender = message.from === nextMessage?.from;
						const isPreviousMessageFromSameSender = message.from === previousMessage?.from;

						const messageSentAt = new Date(message.sentAt);
						const previousMessageSentAt = previousMessage ? new Date(previousMessage.sentAt) : null;
						const quarter = Math.floor(messageSentAt.getMinutes() / 15);
						const sameQuarter =
							previousMessage &&
							messageSentAt.getTime() - previousMessageSentAt!.getTime() < 15 * 60 * 1000 &&
							quarter === Math.floor(previousMessageSentAt!.getMinutes() / 15);
						const shouldGroupMessages = previousMessageSentAt && sameQuarter;
						return (
							<li key={message.id}>
								{(!isPreviousMessageFromSameSender || !shouldGroupMessages) && (
									<div className="flex py-2 space-x-1 text-xs justify-center">
										<strong>
											{formatDate(new Date(message.sentAt), {
												weekday: "long",
												day: "2-digit",
												month: "short",
											})}
										</strong>
										<span>{formatTime(new Date(message.sentAt))}</span>
									</div>
								)}

								<div
									className={clsx(
										isNextMessageFromSameSender ? "pb-1" : "pb-2",
										isOutbound ? "text-right" : "text-left",
									)}
								>
									<span
										className={clsx(
											"inline-block whitespace-pre-line text-left w-[fit-content] p-2 rounded-lg text-white",
											isOutbound ? "bg-[#3194ff] rounded-br-none" : "bg-black rounded-bl-none",
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
			<NewMessageArea recipient={recipient} />
		</>
	);
}
