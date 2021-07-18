import type { NextPage } from "next";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/pro-regular-svg-icons";
import clsx from "clsx";

import { withPageOnboardingRequired } from "../../../lib/session-helpers";
import Layout from "../../components/layout";
import useUser from "../../hooks/use-user";
import { findConversation } from "../../database/sms";
import { decrypt } from "../../database/_encryption";
import { findCustomer } from "../../database/customer";
import type { Sms } from "../../database/_types";
import { SmsType } from "../../database/_types";

type Props = {
	recipient: string;
	conversation: Sms[];
};

const Messages: NextPage<Props> = ({ conversation }) => {
	const { userProfile } = useUser();
	const router = useRouter();
	const pageTitle = `Messages with ${router.query.recipient}`;

	console.log("userProfile", userProfile);

	if (!userProfile) {
		return <Layout title={pageTitle}>Loading...</Layout>;
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
					{conversation.map(message => {
						return (
							<li key={message.id} className={clsx(message.type === SmsType.SENT ? "text-right" : "text-left")}>
								{message.content}
							</li>
						)
					})}
				</ul>
			</div>
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

		const customer = await findCustomer(user.id);
		const conversation = await findConversation(user.id, recipient);
		console.log("conversation", conversation);

		console.log("recipient", recipient);
		return {
			props: {
				recipient,
				conversation: conversation.map(message => ({
					...message,
					content: decrypt(message.content, customer.encryptionKey),
				})),
			},
		};
	},
);

export default Messages;
