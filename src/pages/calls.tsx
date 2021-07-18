import type { InferGetServerSidePropsType, NextPage } from "next";

import { withPageOnboardingRequired } from "../../lib/session-helpers";
import Layout from "../components/layout";
import useUser from "../hooks/use-user";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

const pageTitle = "Calls";

const Calls: NextPage<Props> = (props) => {
	const { userProfile } = useUser();

	console.log("userProfile", userProfile);

	if (!userProfile) {
		return <Layout title={pageTitle}>Loading...</Layout>;
	}

	return (
		<Layout title={pageTitle}>
			<div className="flex flex-col space-y-6 p-6">
				<p>Calls page</p>
			</div>
		</Layout>
	);
};

export const getServerSideProps = withPageOnboardingRequired(
	async (context, user) => {
		return {
			props: { userId: user.id, ddd: 23 as const },
		};
	},
);

export default Calls;
