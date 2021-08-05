import type { ErrorInfo, FunctionComponent } from "react";
import { Component } from "react";
import {
	Head,
	withRouter,
	AuthenticationError,
	AuthorizationError,
	CSRFTokenMismatchError,
	NotFoundError,
	RedirectError,
} from "blitz";
import type { WithRouterProps } from "next/dist/client/with-router";

import appLogger from "../../../../integrations/logger";

import Footer from "./footer";

type Props = {
	title: string;
	pageTitle?: string;
	hideFooter?: true;
};

const logger = appLogger.child({ module: "Layout" });

const Layout: FunctionComponent<Props> = ({ children, title, pageTitle = title, hideFooter = false }) => {
	return (
		<>
			{pageTitle ? (
				<Head>
					<title>{pageTitle}</title>
				</Head>
			) : null}

			<div className="h-full w-full overflow-hidden fixed bg-gray-50">
				<div className="flex flex-col w-full h-full">
					<div className="flex flex-col flex-1 w-full overflow-y-auto">
						<main className="flex-1 my-0 h-full">
							<ErrorBoundary>{children}</ErrorBoundary>
						</main>
					</div>
					{!hideFooter ? <Footer /> : null}
				</div>
			</div>
		</>
	);
};

type ErrorBoundaryState =
	| {
			isError: false;
	  }
	| {
			isError: true;
			errorMessage: string;
	  };

const blitzErrors = [RedirectError, AuthenticationError, AuthorizationError, CSRFTokenMismatchError, NotFoundError];

const ErrorBoundary = withRouter(
	class ErrorBoundary extends Component<WithRouterProps, ErrorBoundaryState> {
		public readonly state = {
			isError: false,
		} as const;

		static getDerivedStateFromError(error: Error): ErrorBoundaryState {
			return {
				isError: true,
				errorMessage: error.message,
			};
		}

		public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
			console.trace("ddd");
			logger.error(error, errorInfo.componentStack);
			if (blitzErrors.some((blitzError) => error instanceof blitzError)) {
				// let Blitz ErrorBoundary handle this one
				throw error;
			}

			// if network error and connection lost, display the auto-reload page with countdown
		}

		public render() {
			if (this.state.isError) {
				return (
					<>
						<h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
							Oops, something went wrong.
						</h2>
						<p className="mt-2 text-center text-lg leading-5 text-gray-600">
							Would you like to{" "}
							<button
								className="inline-flex space-x-2 items-center text-left"
								onClick={this.props.router.reload}
							>
								<span className="transition-colors duration-150 border-b border-primary-200 hover:border-primary-500">
									reload the page
								</span>
							</button>{" "}
							?
						</p>
					</>
				);
			}

			return this.props.children;
		}
	},
);

export default Layout;
