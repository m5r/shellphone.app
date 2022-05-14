import type { MetaFunction } from "@remix-run/node";

import ResetPasswordPage from "~/features/auth/pages/reset-password";
import resetPasswordAction from "~/features/auth/actions/reset-password";
import resetPasswordLoader from "~/features/auth/loaders/reset-password";
import { getSeoMeta } from "~/utils/seo";

export default ResetPasswordPage;
export const action = resetPasswordAction;
export const loader = resetPasswordLoader;
export const meta: MetaFunction = () => ({
	...getSeoMeta({ title: "Reset password" }),
});
