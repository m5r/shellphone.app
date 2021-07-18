import type { NextPage } from "next";
import clsx from "clsx";
import { useForm } from "react-hook-form";

import Alert from "../../components/alert";

import useAuth from "../../hooks/use-auth";

import { withPageAuthNotRequired } from "../../../lib/session-helpers";
import appLogger from "../../../lib/logger";
import Logo from "../../components/logo";

type Form = {
	email: string;
};

const logger = appLogger.child({ page: "/auth/forgot-password" });

const ForgotPassword: NextPage = () => {
	const auth = useAuth();
	const {
		register,
		handleSubmit,
		setError,
		formState: { isSubmitting, isSubmitSuccessful, errors },
	} = useForm<Form>();

	const onSubmit = handleSubmit(async ({ email }) => {
		if (isSubmitting) {
			return;
		}

		try {
			await auth.resetPassword(email);
		} catch (error) {
			logger.error(error);
			setError("email", { message: error.message });
		}
	});

	const errorMessage = errors.email?.message;

	return (
		<div>
			<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="flex flex-col sm:mx-auto sm:w-full sm:max-w-sm">
					<Logo className="mx-auto h-8 w-8" />
					<h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
						Get a new password
					</h2>
					<p className="mt-2 px-4 text-center text-sm leading-5 text-gray-600">
						Enter your user account&apos;s email address and we will
						send you a password reset link.
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

				{isSubmitSuccessful ? (
					<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
						<Alert
							title="Password reset email sent"
							message="Check your inbox for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."
							variant="success"
						/>
					</div>
				) : null}

				<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
					<div className="px-4">
						<form onSubmit={onSubmit}>
							<div>
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
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
										{...register("email")}
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
												"bg-primary-400 hover:bg-primary-400 active:bg-primary-400": isSubmitting,
												"bg-primary-600 hover:bg-primary-500 active:bg-primary-700": !isSubmitting,
											},
										)}
										disabled={isSubmitting}
									>
										{isSubmitting
											? "Loading..."
											: "Send password reset email"}
									</button>
								</span>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;

export const getServerSideProps = withPageAuthNotRequired();
