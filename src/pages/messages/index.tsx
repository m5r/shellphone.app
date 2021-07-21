import type { InferGetServerSidePropsType, NextPage } from "next";
import Link from "next/link";

import { withPageOnboardingRequired } from "../../../lib/session-helpers";
import type { Message } from "../../database/message";
import {  findCustomerMessages } from "../../database/message";
import { findCustomer } from "../../database/customer";
import { decrypt } from "../../database/_encryption";
import useUser from "../../hooks/use-user";
import Layout from "../../components/layout";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const pageTitle = "Messages";

const Messages: NextPage<Props> = ({ conversations }) => {
	const { userProfile } = useUser();

	if (!userProfile) {
		return <Layout title={pageTitle}>Loading...</Layout>;
	}

	return (
		<Layout title={pageTitle}>
			<div className="flex flex-col space-y-6 p-6">
				<p>Messages page</p>
				<ul className="divide-y">
					{Object.entries(conversations).map(([recipient, message]) => {
						return (
							<li key={recipient} className="py-2">
								<Link href={`/messages/${encodeURIComponent(recipient)}`}>
									<a className="flex flex-col">
										<div className="flex flex-row justify-between">
											<strong>{recipient}</strong>
											<div>{new Date(message.sentAt).toLocaleString("fr-FR")}</div>
										</div>
										<div>{message.content}</div>
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

export const getServerSideProps = withPageOnboardingRequired(
	async (context, user) => {
		context.res.setHeader(
			"Cache-Control",
			"private, s-maxage=15, stale-while-revalidate=59",
		);

		const [customer, messages] = await Promise.all([
			findCustomer(user.id),
			findCustomerMessages(user.id),
		]);

		let conversations: Record<Recipient, Message> = {};
		for (const message of messages) {
			let recipient: string;
			if (message.direction === "outbound") {
				recipient = message.to;
			} else {
				recipient = message.from;
			}

			if (
				!conversations[recipient] ||
				message.sentAt > conversations[recipient].sentAt
			) {
				conversations[recipient] = {
					...message,
					content: decrypt(message.content, customer.encryptionKey), // TODO: should probably decrypt on the phone
				};
			}
		}
		conversations = Object.fromEntries(
			Object.entries(conversations).sort(([,a], [,b]) => b.sentAt.localeCompare(a.sentAt))
		);

		return {
			props: { conversations },
		};
	},
);

export default Messages;
