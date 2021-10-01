import { Suspense, useEffect } from "react";
import {
	AppProps,
	ErrorBoundary,
	AuthenticationError,
	AuthorizationError,
	ErrorFallbackProps,
	RedirectError,
	Routes,
	useQueryErrorResetBoundary,
	getConfig,
	useSession,
} from "blitz";

import Sentry from "../../integrations/sentry";
import ErrorComponent from "../core/components/error-component";
import { usePanelbear } from "../core/hooks/use-panelbear";

import "app/core/styles/index.css";

const { publicRuntimeConfig } = getConfig();

export default function App({ Component, pageProps }: AppProps) {
	const session = useSession();
	usePanelbear(publicRuntimeConfig.panelBear.siteId);
	useEffect(() => {
		if (session.userId) {
			Sentry.setUser({
				id: session.userId,
				orgId: session.orgId,
			});
		}
	}, [session]);

	const getLayout = Component.getLayout || ((page) => page);

	return (
		<ErrorBoundary
			onError={(error, componentStack) =>
				Sentry.captureException(error, { contexts: { react: { componentStack } } })
			}
			FallbackComponent={RootErrorFallback}
			onReset={useQueryErrorResetBoundary().reset}
		>
			<Suspense fallback="Silence, ca pousse">{getLayout(<Component {...pageProps} />)}</Suspense>
		</ErrorBoundary>
	);
}

function RootErrorFallback({ error }: ErrorFallbackProps) {
	if (error instanceof AuthenticationError) {
		throw new RedirectError(Routes.SignIn());
	} else if (error instanceof AuthorizationError) {
		return <ErrorComponent statusCode={error.statusCode} title="Sorry, you are not authorized to access this" />;
	} else {
		return <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />;
	}
}
