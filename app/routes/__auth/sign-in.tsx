import type { MetaFunction } from "@remix-run/node";

import SignInPage from "~/features/auth/pages/sign-in";
import signInAction from "~/features/auth/actions/sign-in";
import signInLoader from "~/features/auth/loaders/sign-in";
import { getSeoMeta } from "~/utils/seo";

export default SignInPage;
export const action = signInAction;
export const loader = signInLoader;
export const meta: MetaFunction = () => ({
	...getSeoMeta({ title: "Sign in" }),
});
