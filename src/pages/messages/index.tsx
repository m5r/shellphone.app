import type { InferGetServerSidePropsType, NextPage } from "next";
import Link from "next/link";

import { withPageOnboardingRequired } from "../../../lib/session-helpers";
import type { Message } from "../../database/message";
import {  findCustomerMessages } from "../../database/message";
import { findCustomer } from "../../database/customer";
import { decrypt } from "../../database/_encryption";
import useUser from "../../hooks/use-user";
import Layout from "../../components/layout";
import ConnectedLayout from "../../components/connected-layout";
import { conversationsAtom } from "../../state";
import { useAtom } from "jotai";

type Props = {};

const pageTitle = "Messages";

const Messages: NextPage<Props> = () => {
	const [conversations] = useAtom(conversationsAtom);

	return (
		<ConnectedLayout>
			<Layout title={pageTitle}>
				<div className="flex flex-col space-y-6 p-6">
					<p>Messages page</p>
					<ul className="divide-y">
						{Object.entries(conversations).map(([recipient, messages]) => {
							const lastMessage = messages[messages.length - 1];
							return (
								<li key={recipient} className="py-2">
									<Link href={`/messages/${encodeURIComponent(recipient)}`}>
										<a className="flex flex-col">
											<div className="flex flex-row justify-between">
												<strong>{recipient}</strong>
												<div>{new Date(lastMessage.sentAt).toLocaleString("fr-FR")}</div>
											</div>
											<div>{lastMessage.content}</div>
										</a>
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			</Layout>
		</ConnectedLayout>
	);
};

export default Messages;
