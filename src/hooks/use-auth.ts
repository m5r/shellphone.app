import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";

import supabase from "../supabase/client";

type Credentials = {
	email: string;
	password: string;
};

export default function useAuth() {
	const router = useRouter();
	const redirectToRef = useRef("/messages");

	useEffect(() => {
		const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log("event", event);
			if (["SIGNED_IN", "SIGNED_OUT"].includes(event)) {
				await axios.post("/api/auth/session", { event, session });

				if (event === "SIGNED_IN") {
					await router.push(redirectToRef.current);
				}
			}
		});

		return () => data?.unsubscribe();
	}, []);

	async function signUp({
		email,
		password,
		name,
	}: Credentials & { name: string; redirectTo?: string }) {
		await axios.post("/api/auth/sign-up", { email, password, name });
		await signIn({ email, password, redirectTo: "/welcome/step-one" });
	}

	async function signIn({
		email,
		password,
		redirectTo = "/messages",
	}: Credentials & { redirectTo?: string }) {
		redirectToRef.current = redirectTo;
		const { error } = await supabase.auth.signIn({ email, password });
		if (error) {
			throw error;
		}
	}

	async function signOut() {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	}

	async function resetPassword(email: string) {
		return supabase.auth.api.resetPasswordForEmail(email);
	}

	return {
		signUp,
		signIn,
		signOut,
		resetPassword,
	};
}
