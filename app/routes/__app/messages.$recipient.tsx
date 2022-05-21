import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { Link, useNavigate, useParams } from "@remix-run/react";
import { json, useLoaderData } from "superjson-remix";
import { IoCall, IoChevronBack } from "react-icons/io5";
import { parsePhoneNumber } from "awesome-phonenumber";
import { type Message, Prisma } from "@prisma/client";

import Conversation from "~/features/messages/components/conversation";
import { getSeoMeta } from "~/utils/seo";
import db from "~/utils/db.server";
import { requireLoggedIn } from "~/utils/auth.server";
import newMessageAction from "~/features/messages/actions/messages.$recipient";

export const meta: MetaFunction = ({ params }) => {
	const recipient = decodeURIComponent(params.recipient ?? "");

	return {
		...getSeoMeta({
			title: `Messages with ${recipient}`,
		}),
	};
};

export const action = newMessageAction;

type ConversationType = {
	recipient: string;
	formattedPhoneNumber: string;
	messages: Message[];
};

export type ConversationLoaderData = {
	conversation: ConversationType;
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const { organization } = await requireLoggedIn(request);
	const recipient = decodeURIComponent(params.recipient ?? "");
	const conversation = await getConversation(recipient);

	return json<ConversationLoaderData>({ conversation });

	async function getConversation(recipient: string): Promise<ConversationType> {
		const organizationId = organization.id;
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
		<section className="h-full">
			<header className="absolute top-0 w-screen h-12 backdrop-filter backdrop-blur-sm bg-white bg-opacity-75 border-b items-center flex justify-between">
				<span className="pl-2 cursor-pointer" onClick={() => navigate(-1)}>
					<IoChevronBack className="h-6 w-6" />
				</span>
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
