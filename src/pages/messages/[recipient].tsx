import { useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/pro-regular-svg-icons";
import clsx from "clsx";
import { useForm } from "react-hook-form";

import { withPageOnboardingRequired } from "../../../lib/session-helpers";
import type { Message } from "../../database/message";
import { findConversation } from "../../database/message";
import supabase from "../../supabase/client";
import useUser from "../../hooks/use-user";
import useConversation from "../../hooks/use-conversation";
import Layout from "../../components/layout";

type Props = {
	recipient: string;
	conversation: Message[];
}

type Form = {
	content: string;
}

const Messages: NextPage<Props> = (props) => {
	const { userProfile } = useUser();
	const router = useRouter();
	const recipient = router.query.recipient as string;
	const { conversation, error, refetch, sendMessage } = useConversation({
		initialData: props.conversation,
		recipient,
	});
	const pageTitle = `Messages with ${recipient}`;
	const {
		register,
		handleSubmit,
		setValue,
		formState: {
			isSubmitting,
		},
	} = useForm<Form>();

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
		if (!userProfile) {
			return;
		}

		const subscription = supabase
			.from<Message>(`sms:customerId=eq.${userProfile.id}`)
			.on("INSERT", (payload) => {
				const message = payload.new;
				if ([message.from, message.to].includes(recipient)) {
					refetch();
				}
			})
			.subscribe();

		return () => void subscription.unsubscribe();
	}, [userProfile, recipient, refetch]);

	if (!userProfile) {
		return (
			<Layout title={pageTitle}>
				Loading...
			</Layout>
		);
	}

	if (error) {
		console.error("error", error);
		return (
			<Layout title={pageTitle}>
				Oops, something unexpected happened. Please try reloading the page.
			</Layout>
		);
	}

	return (
		<Layout title={pageTitle}>
			<header className="flex">
				<span className="flex items-center cursor-pointer" onClick={router.back}>
					<FontAwesomeIcon className="h-8 w-8" icon={faChevronLeft} /> Back
				</span>
			</header>
			<div className="flex flex-col space-y-6 p-6">
				<ul>
					{conversation!.map((message, index) => {
						const isOutbound = message.direction === "outbound";
						const isSameSender = message.from === conversation![index + 1]?.from;
						const isLast = index === conversation!.length;
						return (
							<li
								key={message.id}
								className={clsx(
									isSameSender || isLast ? "pb-3" : "pb-4",
									isOutbound ? "text-right" : "text-left",
								)}
							>
								<span
									className={clsx(
										"p-2 rounded-lg text-white",
										isOutbound ? "bg-[#3194ff] rounded-br-none" : "bg-black rounded-bl-none",
									)}
								>
									{message.content}
								</span>
							</li>
						);
					})}
				</ul>
			</div>
			<form onSubmit={onSubmit}>
				<textarea{...register("content")} />
				<button type="submit">Send</button>
			</form>
		</Layout>
	);
};

export const getServerSideProps = withPageOnboardingRequired<Props>(
	async (context, user) => {
		const recipient = context.params?.recipient;
		if (!recipient || Array.isArray(recipient)) {
			return {
				redirect: {
					destination: "/messages",
					permanent: false,
				},
			};
		}

		const conversation = await findConversation(user.id, recipient);

		return {
			props: {
				recipient,
				conversation,
			},
		};
	},
);

export default Messages;
