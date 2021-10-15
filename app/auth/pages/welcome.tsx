import type { BlitzPage, GetServerSideProps } from "blitz";
import { getSession, Routes, useRouter } from "blitz";

const Welcome: BlitzPage = () => {
	const router = useRouter();

	return (
		<div>
			<p>Thanks for joining Shellphone</p>
			<p>Let us know if you need our help</p>
			<p>Make sure to set up your phone number</p>
			<button onClick={() => router.push(Routes.Messages())}>Open my phone</button>
		</div>
	);
};

Welcome.authenticate = { redirectTo: Routes.SignIn() };

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	const session = await getSession(req, res);
	await session.$setPublicData({ shouldShowWelcomeMessage: undefined });

	return {
		props: {},
	};
};

export default Welcome;
