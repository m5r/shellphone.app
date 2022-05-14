import { Suspense } from "react";
import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
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
		/*if (!hasFilledTwilioCredentials) {
			return;
		}*/

		const organizationId = organizations[0].id;
		const organization = await db.organization.findFirst({
			where: { id: organizationId },
			include: { phoneNumbers: true },
		});
		if (!organization || !organization.phoneNumbers[0]) {
			throw new Error("Not found");
		}

		const phoneNumber = organization.phoneNumbers[0]; // TODO: use the active number, not the first one
		const phoneNumberId = phoneNumber.id;
		if (organization.phoneNumbers[0].isFetchingMessages) {
			throw new Error("Not found");
		}

		const formattedPhoneNumber = parsePhoneNumber(recipient).getNumber("international");
		const messages = await db.message.findMany({
			where: {
				phoneNumberId,
				OR: [{ from: recipient }, { to: recipient }],
			},
			orderBy: { sentAt: Prisma.SortOrder.desc },
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
			<Suspense fallback={<div className="pt-12">Loading messages with {recipient}</div>}>
				<Conversation />
			</Suspense>
		</>
	);
}
