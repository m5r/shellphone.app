import type { MetaFunction } from "@remix-run/node";

import RegisterPage from "~/features/auth/pages/register";
import registerAction from "~/features/auth/actions/register";
import registerLoader from "~/features/auth/loaders/register";
import { getSeoMeta } from "~/utils/seo";

export default RegisterPage;
export const action = registerAction;
export const loader = registerLoader;
export const meta: MetaFunction = () => ({
	...getSeoMeta({ title: "Register" }),
});
