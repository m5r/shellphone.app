import { useRouter } from "next/router";
import axios from "axios";
import type { User, UserAttributes } from "@supabase/supabase-js";

import appLogger from "../../lib/logger";
import supabase from "../supabase/client";
import { useAtom } from "jotai";
import { customerAtom } from "../state";
import { Customer } from "../database/customer";

const logger = appLogger.child({ module: "useUser" });

type UseUser = {
	updateUser: (attributes: UserAttributes) => Promise<void>;
	deleteUser: () => Promise<void>;
} & (
	| {
			isLoading: true;
			error: null;
			customer: null;
	  }
	| {
			isLoading: false;
			error: Error;
			customer: Customer | null;
	  }
	| {
			isLoading: false;
			error: null;
			customer: Customer;
	  }
);

export default function useUser(): UseUser {
	const [customer] = useAtom(customerAtom);
	const router = useRouter();

	return {
		isLoading: customer === null,
		customer,
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
