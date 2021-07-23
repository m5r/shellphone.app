import type { NextPage } from "next";

import Layout from "../components/layout";
import ConnectedLayout from "../components/connected-layout";
import { useAtom } from "jotai";
import { phoneCallsAtom } from "../state";

type Props = {};

const pageTitle = "Calls";

const Calls: NextPage<Props> = () => {
	const phoneCalls = useAtom(phoneCallsAtom)[0] ?? [];

	return (
		<ConnectedLayout>
			<Layout title={pageTitle}>
				<div className="flex flex-col space-y-6 p-6">
					<p>Calls page</p>
					<ul className="divide-y">
						{phoneCalls.map((phoneCall) => {
							const recipient = phoneCall.direction === "outbound" ? phoneCall.to : phoneCall.from;
							return (
								<li key={phoneCall.twilioSid} className="flex flex-row justify-between py-2">
									<div>{recipient}</div>
									<div>{new Date(phoneCall.createdAt).toLocaleString("fr-FR")}</div>
								</li>
							)
						})}
					</ul>
				</div>
			</Layout>
		</ConnectedLayout>
	);
};

export default Calls;
