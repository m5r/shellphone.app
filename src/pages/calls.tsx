import type { InferGetServerSidePropsType, NextPage } from "next";

import { withPageOnboardingRequired } from "../../lib/session-helpers";
import { findCustomerPhoneCalls } from "../database/phone-call";
import useUser from "../hooks/use-user";
import Layout from "../components/layout";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const pageTitle = "Calls";

const Calls: NextPage<Props> = ({ phoneCalls }) => {
	const { userProfile } = useUser();

	console.log("userProfile", userProfile);

	if (!userProfile) {
		return <Layout title={pageTitle}>Loading...</Layout>;
	}

	return (
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
	);
};

export const getServerSideProps = withPageOnboardingRequired(
	async ({ res }, user) => {
		res.setHeader(
			"Cache-Control",
			"private, s-maxage=15, stale-while-revalidate=59",
		);

		const phoneCalls = await findCustomerPhoneCalls(user.id);

		return {
			props: { phoneCalls },
		};
	},
);

export default Calls;
