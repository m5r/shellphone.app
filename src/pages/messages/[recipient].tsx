import { useEffect, useRef } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faLongArrowLeft,
	faInfoCircle,
	faPhoneAlt as faPhone,
} from "@fortawesome/pro-regular-svg-icons";
import clsx from "clsx";
import { useForm } from "react-hook-form";

import type { Message } from "../../database/message";
import supabase from "../../supabase/client";
import useUser from "../../hooks/use-user";
import useConversation from "../../hooks/use-conversation";
import Layout from "../../components/layout";
import ConnectedLayout from "../../components/connected-layout";

type Props = {}

type Form = {
	content: string;
}

const Messages: NextPage<Props> = (props) => {
	const { customer } = useUser();
	const router = useRouter();
	const recipient = router.query.recipient as string;
	useEffect(() => {
		if (!router.isReady) {
			return;
		}

		if (!recipient || Array.isArray(recipient)) {
			router.push("/messages");
		}
	}, [recipient, router]);
	const { conversation, error, refetch, sendMessage } = useConversation(recipient);
	const formRef = useRef<HTMLFormElement>(null);
	const {
		register,
		handleSubmit,
		setValue,
		formState: {
			isSubmitting,
		},
	} = useForm<Form>();
	const pageTitle = `Messages with ${recipient}`;
	const onSubmit = handleSubmit(async ({ content }) => {
		if (isSubmitting) {
			return;
		}

		sendMessage.mutate({
			to: recipient,
			content,
		});
		setValue("content", "");
	});

	useEffect(() => {
		if (!customer) {
			return;
		}

		const subscription = supabase
			.from<Message>(`sms:customerId=eq.${customer.id}`)
			.on("INSERT", (payload) => {
				const message = payload.new;
				if ([message.from, message.to].includes(recipient)) {
					refetch();
				}
			})
			.subscribe();

		return () => void subscription.unsubscribe();
	}, [customer, recipient, refetch]);

	useEffect(() => {
		if (formRef.current) {
			formRef.current.scrollIntoView();
		}
	}, [conversation]);

	if (error) {
		console.error("error", error);
		return (
			<ConnectedLayout>
				<Layout title={pageTitle}>
					Oops, something unexpected happened. Please try reloading the page.
				</Layout>
			</ConnectedLayout>
		);
	}

	if (!conversation) {
		return (
			<ConnectedLayout>
				<Layout title={pageTitle}>
					Loading...
				</Layout>
			</ConnectedLayout>
		);
	}

	return (
		<ConnectedLayout>
			<Layout title={pageTitle}>
				<header className="absolute top-0 w-screen h-12 backdrop-blur-sm bg-white bg-opacity-75 border-b grid grid-cols-3 items-center">
					<span className="col-start-1 col-span-1 pl-2 cursor-pointer" onClick={router.back}>
						<FontAwesomeIcon size="lg" className="h-8 w-8" icon={faLongArrowLeft} />
					</span>
					<strong className="col-span-1">
						{recipient}
					</strong>
					<span className="col-span-1 text-right space-x-4 pr-2">
						<FontAwesomeIcon size="lg" className="h-8 w-8" icon={faPhone} />
						<FontAwesomeIcon size="lg" className="h-8 w-8" icon={faInfoCircle} />
					</span>
				</header>
				<div className="flex flex-col space-y-6 p-6 pt-12">
					<ul>
						{conversation.map((message, index) => {
							const isOutbound = message.direction === "outbound";
							const nextMessage = conversation![index + 1];
							const previousMessage = conversation![index - 1];
							const isSameNext = message.from === nextMessage?.from;
							const isSamePrevious = message.from === previousMessage?.from;
							const differenceInMinutes = previousMessage ? (new Date(message.sentAt).getTime() - new Date(previousMessage.sentAt).getTime()) / 1000 / 60 : 0;
							const isTooLate = differenceInMinutes > 15;
							console.log("message.from === previousMessage?.from", message.from, previousMessage?.from);
							return (
								<li key={message.id}>
									{
										(!isSamePrevious || isTooLate) && (
											<div className="flex py-2 space-x-1 text-xs justify-center">
												<strong>{new Date(message.sentAt).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "short" })}</strong>
												<span>{new Date(message.sentAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
											</div>
										)
									}

									<div
										className={clsx(
											isSameNext ? "pb-1" : "pb-2",
											isOutbound ? "text-right" : "text-left",
										)}
									>
										<span
											className={clsx(
												"inline-block text-left w-[fit-content] p-2 rounded-lg text-white",
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
				<form ref={formRef} onSubmit={onSubmit}>
					<textarea{...register("content")} />
					<button type="submit">Send</button>
				</form>
			</Layout>
		</ConnectedLayout>
	);
};

export default Messages;
