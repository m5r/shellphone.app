import type {
	GetServerSideProps,
	GetServerSidePropsContext,
	GetServerSidePropsResult,
	NextApiHandler,
	NextApiRequest,
	NextApiResponse,
} from "next";
import type { User } from "@supabase/supabase-js";

import supabase from "../src/supabase/server";
import appLogger from "./logger";
import { setCookie } from "./utils/cookies";
import { findCustomer } from "../src/database/customer";
import { findCustomerPhoneNumber } from "../src/database/phone-number";

const logger = appLogger.child({ module: "session-helpers" });

type EmptyProps = Record<string, unknown>;

type SessionProps = {
	user: User;
};

function hasProps<Props extends EmptyProps = EmptyProps>(
	result: GetServerSidePropsResult<Props>,
): result is { props: Props } {
	return result.hasOwnProperty("props");
}

export function withPageOnboardingRequired<Props extends EmptyProps = EmptyProps>(
	getServerSideProps?: GSSPWithSession<Props>,
) {
	return withPageAuthRequired(
		async function wrappedGetServerSideProps(context, user) {
			if (context.req.cookies.hasDoneOnboarding !== "true") {
				try {
					const customer = await findCustomer(user.id);
					console.log("customer", customer);
					if (!customer.accountSid || !customer.authToken) {
						return {
							redirect: {
								destination: "/welcome/step-two",
								permanent: false,
							},
						};
					}
					/*if (!customer.paddleCustomerId || !customer.paddleSubscriptionId) {
						return {
							redirect: {
								destination: "/welcome/step-one",
								permanent: false,
							},
						};
					}*/
					try {
						await findCustomerPhoneNumber(user.id);
					} catch (error) {
						console.log("error", error);
						return {
							redirect: {
								destination: "/welcome/step-three",
								permanent: false,
							},
						};
					}

					setCookie({
						req: context.req,
						res: context.res,
						name: "hasDoneOnboarding",
						value: "true",
					});
				} catch (error) {
					console.error("error", error);
				}
			}

			if (!getServerSideProps) {
				return {
					props: {} as Props,
				};
			}

			return getServerSideProps(context, user);
		},
	);
}

type GSSPWithSession<Props> = (
	context: GetServerSidePropsContext,
	user: User,
) => GetServerSidePropsResult<Props> | Promise<GetServerSidePropsResult<Props>>;

export function withPageAuthRequired<Props extends EmptyProps = EmptyProps>(
	getServerSideProps?: GSSPWithSession<Props>,
): GetServerSideProps<Omit<Props, "user"> & SessionProps> {
	return async function wrappedGetServerSideProps(context) {
		const redirectTo = `/auth/sign-in?redirectTo=${context.resolvedUrl}`;
		const userResponse = await supabase.auth.api.getUserByCookie(context.req);
		const user = userResponse.user!;
		if (userResponse.error) {
			return {
				redirect: {
					destination: redirectTo,
					permanent: false,
				},
			};
		}

		if (!getServerSideProps) {
			return {
				props: { user } as Props & SessionProps,
			};
		}

		const getServerSidePropsResult = await getServerSideProps(
			context,
			user,
		);
		if (!hasProps(getServerSidePropsResult)) {
			return getServerSidePropsResult;
		}

		return {
			props: {
				...getServerSidePropsResult.props,
				user,
			},
		};
	};
}

type ApiHandlerWithAuth<T> = (
	req: NextApiRequest,
	res: NextApiResponse<T>,
	user: User,
) => void | Promise<void>;

export function withApiAuthRequired<T = any>(
	handler: ApiHandlerWithAuth<T>,
): NextApiHandler {
	return async function wrappedApiHandler(req, res) {
		const userResponse = await supabase.auth.api.getUserByCookie(req);
		if (userResponse.error) {
			logger.error(userResponse.error.message);
			return res.status(401).end();
		}

		return handler(req, res, userResponse.user!);
	};
}

export function withPageAuthNotRequired<Props extends EmptyProps = EmptyProps>(
	getServerSideProps?: GetServerSideProps<Props>,
): GetServerSideProps<Props> {
	return async function wrappedGetServerSideProps(context) {
		let redirectTo: string;
		if (Array.isArray(context.query.redirectTo)) {
			redirectTo = context.query.redirectTo[0];
		} else {
			redirectTo = context.query.redirectTo ?? "/messages";
		}

		const { user } = await supabase.auth.api.getUserByCookie(context.req);
		console.log("user", user);
		if (user !== null) {
			console.log("redirect");
			return {
				redirect: {
					destination: redirectTo,
					permanent: false,
				},
			};
		}

		console.log("no redirect");
		if (getServerSideProps) {
			return getServerSideProps(context);
		}

		return { props: {} as Props };
	};
}
