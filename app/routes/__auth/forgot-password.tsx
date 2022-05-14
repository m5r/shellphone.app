import type { MetaFunction } from "@remix-run/node";

import ForgotPasswordPage from "~/features/auth/pages/forgot-password";
import forgotPasswordAction from "~/features/auth/actions/forgot-password";
import forgotPasswordLoader from "~/features/auth/loaders/forgot-password";
import { getSeoMeta } from "~/utils/seo";

export default ForgotPasswordPage;
export const action = forgotPasswordAction;
export const loader = forgotPasswordLoader;
export const meta: MetaFunction = () => ({
	...getSeoMeta({ title: "Forgot password" }),
});
