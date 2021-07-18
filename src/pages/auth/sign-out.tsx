import type { NextPage } from "next";
import { useEffect } from "react";
import Link from "next/link";

import useAuth from "../../hooks/use-auth";

const SignOut: NextPage = () => {
	const auth = useAuth();

	useEffect(() => void auth.signOut());

	return (
		<div className="py-12 px-10 my-16 mx-auto w-1/2 leading-5 text-gray-900 bg-white rounded border border-gray-400 border-solid shadow-xs max-w-[400px]">
			<div className="block mx-auto w-11/12 text-center max-w-screen-lg">
				<h1 className="p-0 text-4xl font-black text-gray-700 normal-case min-h-[1rem]">
					See you again soon!
				</h1>
				<Link href="/auth/sign-in">
					<a className="font-bold text-teal-600 no-underline cursor-pointer hover:text-gray-800 hover:no-underline">
						Log back in
					</a>
				</Link>
				<br />
				<Link href="/">
					<a className="font-bold text-teal-600 no-underline cursor-pointer hover:text-gray-800 hover:no-underline">
						Back to home
					</a>
				</Link>
			</div>
		</div>
	);
};

export default SignOut;
