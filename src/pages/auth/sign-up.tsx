import type { NextPage } from "next";

import { withPageAuthNotRequired } from "../../../lib/session-helpers";
import AuthPage from "../../components/auth/auth-page";

const SignUp: NextPage = () => {
	return <AuthPage authType="signUp" />;
};

export default SignUp;

export const getServerSideProps = withPageAuthNotRequired();
