import { Suspense } from "react";
import type { BlitzPage } from "blitz";
import { useParam, useRouter } from "blitz";
import { IoChevronBack, IoInformationCircle, IoCall } from "react-icons/io5";

import AppLayout from "../../../core/layouts/layout";
import Conversation from "../../components/conversation";
import useConversation from "../../hooks/use-conversation";

const ConversationPage: BlitzPage = () => {
	const router = useRouter();
	const recipient = decodeURIComponent(useParam("recipient", "string") ?? "");
	const pageTitle = `Messages with ${recipient}`;
	const conversation = useConversation(recipient)[0];

	return (
		<AppLayout title={pageTitle} hideFooter>
			<header className="absolute top-0 w-screen h-12 backdrop-filter backdrop-blur-sm bg-white bg-opacity-75 border-b grid grid-cols-3 items-center">
				<span className="col-start-1 col-span-1 pl-2 cursor-pointer" onClick={router.back}>
					<IoChevronBack className="h-8 w-8" />
				</span>
				<strong className="col-span-1">{conversation?.formattedPhoneNumber ?? recipient}</strong>
				<span className="col-span-1 flex justify-end space-x-4 pr-2">
					<IoCall className="h-8 w-8" />
					<IoInformationCircle className="h-8 w-8" />
				</span>
			</header>
			<Suspense fallback={<div className="pt-12">Loading messages with {recipient}</div>}>
				<Conversation />
			</Suspense>
		</AppLayout>
	);
};

export default ConversationPage;
