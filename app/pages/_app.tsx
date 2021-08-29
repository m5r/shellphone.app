import { Suspense } from "react";
import {
	AppProps,
	ErrorBoundary,
	ErrorComponent,
	AuthenticationError,
	AuthorizationError,
	ErrorFallbackProps,
	useQueryErrorResetBoundary,
	getConfig,
} from "blitz";

import LoginForm from "../auth/components/login-form";
import { usePanelbear } from "../core/hooks/use-panelbear";

import "app/core/styles/index.css";

const { publicRuntimeConfig } = getConfig();

export default function App({ Component, pageProps }: AppProps) {
	usePanelbear(publicRuntimeConfig.panelBear.siteId);

	const getLayout = Component.getLayout || ((page) => page);

	return (
		<ErrorBoundary FallbackComponent={RootErrorFallback} onReset={useQueryErrorResetBoundary().reset}>
			<Suspense fallback="Silence, ca pousse">{getLayout(<Component {...pageProps} />)}</Suspense>
		</ErrorBoundary>
	);
}

function RootErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
	if (error instanceof AuthenticationError) {
		return <LoginForm onSuccess={resetErrorBoundary} />;
	} else if (error instanceof AuthorizationError) {
		return <ErrorComponent statusCode={error.statusCode} title="Sorry, you are not authorized to access this" />;
	} else {
		return <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />;
	}
}
