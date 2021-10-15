import { DefaultCtx, SessionContext, SimpleRolesIsAuthorized } from "blitz";

import { Organization, User, GlobalRole, MembershipRole } from "./db";

type Role = GlobalRole | MembershipRole;

declare module "blitz" {
	export interface Ctx extends DefaultCtx {
		session: SessionContext;
	}

	export interface Session {
		isAuthorized: SimpleRolesIsAuthorized<Role>;
		PublicData: {
			userId: User["id"];
			roles: Role[];
			orgId: Organization["id"];
			shouldShowWelcomeMessage?: true;
		};
	}
}
