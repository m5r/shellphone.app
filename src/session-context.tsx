import type { Dispatch, ReactNode, Reducer, ReducerAction } from "react";
import { createContext, useEffect, useReducer } from "react";
import type { User } from "@supabase/supabase-js";
import supabase from "./supabase/client";

type Context = {
	state: SessionState;
	dispatch: Dispatch<ReducerAction<typeof sessionReducer>>;
};

export const SessionContext = createContext<Context>(null as any);

type ProviderProps = {
	children: ReactNode;
	user?: User | null;
};

function getInitialState(initialUser: User | null | undefined): SessionState {
	if (!initialUser) {
		return {
			state: "LOADING",
			user: null,
			error: null,
		};
	}

	return {
		state: "SUCCESS",
		user: initialUser,
		error: null,
	};
}

export function SessionProvider({ children, user }: ProviderProps) {
	const [state, dispatch] = useReducer(
		sessionReducer,
		getInitialState(user),
	);

	useEffect(() => {
		supabase.auth.onAuthStateChange((event, session) => {
			console.log("event", event);
			if (["SIGNED_IN", "USER_UPDATED"].includes(event)) {
				dispatch({
					type: "SET_SESSION",
					user: session!.user!,
				});
			}
		});

		if (state.user === null) {
			dispatch({
				type: "SET_SESSION",
				user: supabase.auth.user()!,
			});
		}
	}, []);

	return (
		<SessionContext.Provider value={{ state, dispatch }}>
			{children}
		</SessionContext.Provider>
	);
}

type SessionState =
	| {
			state: "LOADING";
			user: null;
			error: null;
	  }
	| {
			state: "SUCCESS";
			user: User;
			error: null;
	  }
	| {
			state: "ERROR";
			user: User | null;
			error: Error;
	  };

type Action =
	| { type: "SET_SESSION"; user: User }
	| { type: "THROW_ERROR"; error: Error };

const sessionReducer: Reducer<SessionState, Action> = (state, action) => {
	switch (action.type) {
		case "SET_SESSION":
			return {
				...state,
				state: "SUCCESS",
				user: action.user,
				error: null,
			};
		case "THROW_ERROR":
			return {
				...state,
				state: "ERROR",
				error: action.error,
			};
		default:
			throw new Error("unreachable");
	}
};
