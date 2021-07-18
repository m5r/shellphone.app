import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "clsx";
import { useForm } from "react-hook-form";

import Alert from "../alert";

import useAuth from "../../hooks/use-auth";

import appLogger from "../../../lib/logger";
import Logo from "../logo";

type Props = {
	authType: "signIn" | "signUp";
};

const logger = appLogger.child({ module: "AuthPage" });

type Form = {
	name: string;
	email: string;
	password: string;
};

function AuthPage({ authType }: Props) {
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const auth = useAuth();
	const router = useRouter();
	const { register, handleSubmit } = useForm<Form>();
	const [errorMessage, setErrorMessage] = useState("");

	const texts = TEXTS[authType];
	let redirectTo: string;
	if (Array.isArray(router.query.redirectTo)) {
		redirectTo = router.query.redirectTo[0];
	} else {
		redirectTo = router.query.redirectTo ?? "/messages";
	}

	const onSubmit = handleSubmit(async ({ email, password, name }) => {
		setErrorMessage("");
		if (isSubmitting) {
			return;
		}

		setIsSubmitting(true);
		const params = { email, password, name, redirectTo };
		try {
			if (authType === "signIn") {
				await auth.signIn(params);
			}

			if (authType === "signUp") {
				await auth.signUp(params);
			}
		} catch (error) {
			logger.error(error);
			console.log("error", error);
			setErrorMessage(
				error.isAxiosError ?
					error.response.data.errorMessage :
					error.message
			);
			setIsSubmitting(false);
		}
	});

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="flex flex-col sm:mx-auto sm:w-full sm:max-w-sm">
				<Logo className="mx-auto h-8 w-8" />
				<h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
					{texts.title}
				</h2>
				<p className="mt-2 text-center text-sm leading-5 text-gray-600">
					{texts.subtitle}
				</p>
			</div>

			{errorMessage ? (
				<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
					<Alert
						title="Oops, there was an issue"
						message={errorMessage}
						variant="error"
					/>
				</div>
			) : null}

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
				<div className="py-8 px-4">
					<form onSubmit={onSubmit}>
						{authType === "signUp" ? (
							<div className="mb-6">
								<label
									htmlFor="name"
									className="block text-sm font-medium leading-5 text-gray-700"
								>
									Name
								</label>
								<div className="mt-1 rounded-md shadow-sm">
									<input
										id="name"
										type="text"
										tabIndex={1}
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
										{...register("name")}
										required
									/>
								</div>
							</div>
						) : null}

						<div className="mb-6">
							<label
								htmlFor="email"
								className="block text-sm font-medium leading-5 text-gray-700"
							>
								Email address
							</label>
							<div className="mt-1 rounded-md shadow-sm">
								<input
									id="email"
									type="email"
									tabIndex={1}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
									{...register("email")}
									required
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="flex justify-between text-sm font-medium leading-5 text-gray-700"
							>
								<div>Password</div>

								{authType === "signIn" ? (
									<div>
										<Link href="/auth/forgot-password">
											<a className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition ease-in-out duration-150">
												Forgot your password?
											</a>
										</Link>
									</div>
								) : null}
							</label>
							<div className="mt-1 rounded-md shadow-sm">
								<input
									id="password"
									type="password"
									tabIndex={2}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
									{...register("password")}
									required
								/>
							</div>
						</div>

						<div className="mt-6">
							<span className="block w-full rounded-md shadow-sm">
								<button
									type="submit"
									className={clsx(
										"w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:border-primary-700 focus:shadow-outline-primary transition duration-150 ease-in-out",
										{
											"bg-primary-400 cursor-not-allowed": isSubmitting,
											"bg-primary-600 hover:bg-primary-700": !isSubmitting,
										},
									)}
									disabled={isSubmitting}
								>
									{isSubmitting
										? "Loading..."
										: texts.actionButton}
								</button>
							</span>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default AuthPage;

type Texts = {
	title: string;
	subtitle: ReactNode;
	actionButton: string;
};

const TEXTS: Record<Props["authType"], Texts> = {
	signUp: {
		title: "Create your account",
		subtitle: (
			<Link href="/auth/sign-in">
				<a className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition ease-in-out duration-150">
					Already have an account?
				</a>
			</Link>
		),
		actionButton: "Sign up",
	},
	signIn: {
		title: "Welcome back!",
		subtitle: (
			<>
				Need an account?&nbsp;
				<Link href="/auth/sign-up">
					<a className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition ease-in-out duration-150">
						Create yours for free
					</a>
				</Link>
			</>
		),
		actionButton: "Sign in",
	},
};
