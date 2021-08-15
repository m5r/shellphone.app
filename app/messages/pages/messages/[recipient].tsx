import { Suspense } from "react";
import type { BlitzPage } from "blitz";
import { Routes, useRouter } from "blitz";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowLeft, faInfoCircle, faPhoneAlt as faPhone } from "@fortawesome/pro-regular-svg-icons";

import Layout from "../../../core/layouts/layout";
import Conversation from "../../components/conversation";
import useRequireOnboarding from "../../../core/hooks/use-require-onboarding";

const ConversationPage: BlitzPage = () => {
	useRequireOnboarding();

	const router = useRouter();
	const recipient = decodeURIComponent(router.params.recipient);

	return (
		<>
			<header className="absolute top-0 w-screen h-12 backdrop-filter backdrop-blur-sm bg-white bg-opacity-75 border-b grid grid-cols-3 items-center">
				<span className="col-start-1 col-span-1 pl-2 cursor-pointer" onClick={router.back}>
					<FontAwesomeIcon size="lg" className="h-8 w-8" icon={faLongArrowLeft} />
				</span>
				<strong className="col-span-1 text-center">{recipient}</strong>
				<span className="col-span-1 flex justify-end space-x-4 pr-2">
					<FontAwesomeIcon size="lg" className="h-8 w-8" icon={faPhone} />
					<FontAwesomeIcon size="lg" className="h-8 w-8" icon={faInfoCircle} />
				</span>
			</header>
			<Suspense fallback={<div className="pt-12">Loading messages with {recipient}</div>}>
				<Conversation />
			</Suspense>
		</>
	);
};

ConversationPage.getLayout = function ConversationLayout(page) {
	const router = useRouter();
	const recipient = decodeURIComponent(router.params.recipient);
	const pageTitle = `Messages with ${recipient}`;

	return (
		<Layout title={pageTitle} hideFooter>
			{page}
		</Layout>
	);
};

ConversationPage.authenticate = { redirectTo: Routes.SignIn() };

export default ConversationPage;
