import { forwardRef, PropsWithoutRef } from "react";
import { Link, Routes } from "blitz";
import { useFormContext } from "react-hook-form";
import clsx from "clsx";

export interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
	/** Field name. */
	name: string;
	/** Field label. */
	label: string;
	/** Field type. Doesn't include radio buttons and checkboxes */
	type?: "text" | "password" | "email" | "number";
	showForgotPasswordLabel?: boolean;
}

export const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
	({ label, name, showForgotPasswordLabel, ...props }, ref) => {
		const {
			register,
			formState: { isSubmitting, errors },
		} = useFormContext();
		const error = Array.isArray(errors[name]) ? errors[name].join(", ") : errors[name]?.message || errors[name];

		return (
			<div className="mb-6">
				<label
					htmlFor="name"
					className={clsx("text-sm font-medium leading-5 text-gray-700", {
						block: !showForgotPasswordLabel,
						"flex justify-between": showForgotPasswordLabel,
					})}
				>
					{label}
					{showForgotPasswordLabel ? (
						<div>
							<Link href={Routes.ForgotPasswordPage()}>
								<a className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none focus:underline transition ease-in-out duration-150">
									Forgot your password?
								</a>
							</Link>
						</div>
					) : null}
				</label>
				<div className="mt-1 rounded-md shadow-sm">
					<input
						id="name"
						type="text"
						tabIndex={1}
						className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
						disabled={isSubmitting}
						{...register(name)}
						{...props}
					/>
				</div>

				{error ? (
					<div role="alert" className="text-red-600">
						{error}
					</div>
				) : null}
			</div>
		);
	},
);

export default LabeledTextField;
