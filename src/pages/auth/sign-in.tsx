import type { NextPage } from "next";

import { withPageAuthNotRequired } from "../../../lib/session-helpers";
import AuthPage from "../../components/auth/auth-page";

const SignIn: NextPage = () => {
	return <AuthPage authType="signIn" />;
};

export default SignIn;

export const getServerSideProps = withPageAuthNotRequired();
