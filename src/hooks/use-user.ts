import { useContext } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import type { User, UserAttributes } from "@supabase/supabase-js";

import { SessionContext } from "../session-context";
import appLogger from "../../lib/logger";
import supabase from "../supabase/client";

const logger = appLogger.child({ module: "useUser" });

type UseUser = {
	updateUser: (attributes: UserAttributes) => Promise<void>;
	deleteUser: () => Promise<void>;
} & (
	| {
			isLoading: true;
			error: null;
			userProfile: null;
	  }
	| {
			isLoading: false;
			error: Error;
			userProfile: User | null;
	  }
	| {
			isLoading: false;
			error: null;
			userProfile: User;
	  }
);

export default function useUser(): UseUser {
	const session = useContext(SessionContext);
	const router = useRouter();

	return {
		isLoading: session.state.user === null,
		userProfile: session.state.user,
		error: session.state.error,
		async deleteUser() {
			await axios.post("/api/user/delete-user", null, {
				withCredentials: true,
			});
			router.push("/api/auth/sign-out");
		},
		async updateUser(attributes: UserAttributes) {
			const { error } = await supabase.auth.update(attributes);
			if (error) throw error;
		}
	} as UseUser;
}
