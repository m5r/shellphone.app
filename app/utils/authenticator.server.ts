import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";

import { sessionStorage } from "./session.server";
import { type SessionUser, login } from "./auth.server";

const authenticator = new Authenticator<SessionUser>(sessionStorage);

authenticator.use(new FormStrategy(login), "email-password");

export default authenticator;
