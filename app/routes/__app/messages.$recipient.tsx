import { Suspense } from "react";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { json, useLoaderData } from "superjson-remix";
import { IoCall, IoChevronBack, IoInformationCircle } from "react-icons/io5";
import { type Message, Prisma } from "@prisma/client";

import Conversation from "~/features/messages/components/conversation";
import { getSeoMeta } from "~/utils/seo";
import db from "~/utils/db.server";
import { parsePhoneNumber } from "awesome-phonenumber";
import { requireLoggedIn } from "~/utils/auth.server";

export const meta: MetaFunction = ({ params }) => {
	const recipient = decodeURIComponent(params.recipient ?? "");

	return {
		...getSeoMeta({
			title: `Messages with ${recipient}`,
		}),
	};
};

type ConversationType = {
	recipient: string;
	formattedPhoneNumber: string;
	messages: Message[];
};

export type ConversationLoaderData = {
	conversation: ConversationType;
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const { organizations } = await requireLoggedIn(request);
	const recipient = decodeURIComponent(params.recipient ?? "");
	const conversation = await getConversation(recipient);

	return json<ConversationLoaderData>({ conversation });

	async function getConversation(recipient: string): Promise<ConversationType> {
		const organizationId = organizations[0].id;
		const phoneNumber = await db.phoneNumber.findUnique({
			where: { organizationId_isCurrent: { organizationId, isCurrent: true } },
		});
		if (!phoneNumber || phoneNumber.isFetchingMessages) {
			throw new Error("unreachable");
		}

		const formattedPhoneNumber = parsePhoneNumber(recipient).getNumber("international");
		const messages = await db.message.findMany({
			where: {
				phoneNumberId: phoneNumber.id,
				OR: [{ from: recipient }, { to: recipient }],
			},
			orderBy: { sentAt: Prisma.SortOrder.asc },
		});
		return {
			recipient,
			formattedPhoneNumber,
			messages,
		};
	}
};

export default function ConversationPage() {
	const navigate = useNavigate();
	const params = useParams<{ recipient: string }>();
	const recipient = decodeURIComponent(params.recipient ?? "");
	const { conversation } = useLoaderData<ConversationLoaderData>();

	return (
		<>
			<header className="absolute top-0 w-screen h-12 backdrop-filter backdrop-blur-sm bg-white bg-opacity-75 border-b grid grid-cols-3 items-center">
				<span className="col-start-1 col-span-1 pl-2 cursor-pointer" onClick={() => navigate(-1)}>
					<IoChevronBack className="h-8 w-8" />
				</span>
				<strong className="col-span-1">{conversation?.formattedPhoneNumber ?? recipient}</strong>
				<span className="col-span-1 flex justify-end space-x-4 pr-2">
					<IoCall className="h-8 w-8" />
					<IoInformationCircle className="h-8 w-8" />
				</span>
			</header>
			{/*<Suspense fallback={<div className="pt-12">Loading messages with {recipient}</div>}>*/}
			<Conversation />
			{/*</Suspense>*/}
		</>
	);
}
