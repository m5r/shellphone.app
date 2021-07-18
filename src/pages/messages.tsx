import type { InferGetServerSidePropsType, NextPage } from "next";
import Link from "next/link";

import { withPageOnboardingRequired } from "../../lib/session-helpers";
import Layout from "../components/layout";
import useUser from "../hooks/use-user";
import type { Sms } from "../database/_types";
import { SmsType } from "../database/_types";
import {  findCustomerMessages } from "../database/sms";
import { findCustomer } from "../database/customer";
import { decrypt } from "../database/_encryption";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const pageTitle = "Messages";

const Messages: NextPage<Props> = ({ conversations }) => {
	const { userProfile } = useUser();

	if (!userProfile) {
		return <Layout title={pageTitle}>Loading...</Layout>;
	}

	console.log("conversations", conversations);

	return (
		<Layout title={pageTitle}>
			<div className="flex flex-col space-y-6 p-6">
				<p>Messages page</p>
				<ul>
					{Object.entries(conversations).map(([recipient, conversation]) => {
						const lastMessage = conversation[conversation.length - 1];
						return (
							<li key={recipient}>
								<Link href={`/messages/${recipient}`}>
									<a>
										<div>{recipient}</div>
										<div>{lastMessage.content}</div>
									</a>
								</Link>
							</li>
						)
					})}
				</ul>
			</div>
		</Layout>
	);
};

type Recipient = string;
export type Conversation = Record<Recipient, Sms[]>;

export const getServerSideProps = withPageOnboardingRequired(
	async (context, user) => {
		const customer = await findCustomer(user.id);
		const messages = await findCustomerMessages(user.id);
		const conversations = messages.reduce<Conversation>((acc, message) => {
			let recipient: string;
			if (message.type === SmsType.SENT) {
				recipient = message.to;
			} else {
				recipient = message.from;
			}

			if (!acc[recipient]) {
				acc[recipient] = [];
			}

			acc[recipient].push({
				...message,
				content: decrypt(message.content, customer.encryptionKey), // TODO: should probably decrypt on the phone
			});

			return acc;
		}, {});

		return {
			props: { conversations },
		};
	},
);

export default Messages;
