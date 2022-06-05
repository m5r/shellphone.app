import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { useLoaderData } from "superjson-remix";
import { IoCall, IoChevronBack } from "react-icons/io5";

import Conversation from "~/features/messages/components/conversation";
import { getSeoMeta } from "~/utils/seo";
import conversationAction from "~/features/messages/actions/messages.$recipient";
import conversationLoader, { type ConversationLoaderData } from "~/features/messages/loaders/messages.$recipient";

export const meta: MetaFunction = ({ params }) => {
	const recipient = decodeURIComponent(params.recipient ?? "");

	return {
		...getSeoMeta({
			title: `Messages with ${recipient}`,
		}),
	};
};

export const action = conversationAction;

export const loader = conversationLoader;

export default function ConversationPage() {
	const params = useParams<{ recipient: string }>();
	const recipient = decodeURIComponent(params.recipient ?? "");
	const { conversation } = useLoaderData<ConversationLoaderData>();

	return (
		<section className="h-full">
			<header className="absolute top-0 w-screen h-12 backdrop-filter backdrop-blur-sm bg-white bg-opacity-75 border-b items-center flex justify-between">
				<Link className="pl-2 cursor-pointer" to="/messages">
					<IoChevronBack className="h-6 w-6" />
				</Link>
				<strong className="absolute right-0 left-0 text-center pointer-events-none">
					{conversation?.formattedPhoneNumber ?? recipient}
				</strong>
				<Link prefetch="intent" to={`/outgoing-call/${encodeURI(recipient)}`} className="pr-2">
					<IoCall className="h-6 w-6" />
				</Link>
			</header>
			<Conversation />
		</section>
	);
}

export const handle = { hideFooter: true };
