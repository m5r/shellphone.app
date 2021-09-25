import { useState, ReactNode, PropsWithoutRef } from "react";
import { FormProvider, useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Alert from "../../core/components/alert";
import clsx from "clsx";
import Logo from "../../core/components/logo";
import { Link, Routes } from "blitz";

export interface FormProps<S extends z.ZodType<any, any>>
	extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
	/** All your form fields */
	children?: ReactNode;
	texts: {
		title: string;
		subtitle: ReactNode;
		submit: string;
	};
	schema?: S;
	onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>;
	initialValues?: UseFormProps<z.infer<S>>["defaultValues"];
}

interface OnSubmitResult {
	FORM_ERROR?: string;

	[prop: string]: any;
}

export const FORM_ERROR = "FORM_ERROR";

export function AuthForm<S extends z.ZodType<any, any>>({
	children,
	texts,
	schema,
	initialValues,
	onSubmit,
	...props
}: FormProps<S>) {
	const ctx = useForm<z.infer<S>>({
		mode: "onBlur",
		resolver: schema ? zodResolver(schema) : undefined,
		defaultValues: initialValues,
	});
	const [formError, setFormError] = useState<string | null>(null);

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="flex flex-col sm:mx-auto sm:w-full sm:max-w-sm">
				<Logo className="mx-auto h-12 w-12" />
				<h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">{texts.title}</h2>
				<p className="mt-2 text-center text-sm leading-5 text-gray-600">{texts.subtitle}</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
				<FormProvider {...ctx}>
					<form
						onSubmit={ctx.handleSubmit(async (values) => {
							const result = (await onSubmit(values)) || {};
							for (const [key, value] of Object.entries(result)) {
								if (key === FORM_ERROR) {
									setFormError(value);
								} else {
									ctx.setError(key as any, {
										type: "submit",
										message: value,
									});
								}
							}
						})}
						className="form"
						{...props}
					>
						{children}

						{formError ? (
							<div role="alert" className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
								<Alert title="Oops, there was an issue" message={formError} variant="error" />
							</div>
						) : null}

						<button
							type="submit"
							disabled={ctx.formState.isSubmitting}
							className={clsx(
								"w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:border-primary-700 focus:shadow-outline-primary transition duration-150 ease-in-out",
								{
									"bg-primary-400 cursor-not-allowed": ctx.formState.isSubmitting,
									"bg-primary-600 hover:bg-primary-700": !ctx.formState.isSubmitting,
								},
							)}
						>
							{texts.submit}
						</button>
					</form>
				</FormProvider>
			</div>
		</div>
	);
}

export default AuthForm;
