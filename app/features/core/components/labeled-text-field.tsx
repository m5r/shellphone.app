import type { FunctionComponent, InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Props = {
	name: string;
	label: ReactNode;
	sideLabel?: ReactNode;
	type?: "text" | "password" | "email";
	error?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type">;

const LabeledTextField: FunctionComponent<Props> = ({ name, label, sideLabel, type = "text", error, ...props }) => {
	const hasSideLabel = !!sideLabel;

	return (
		<div className="mb-6">
			<label
				htmlFor={name}
				className={clsx("text-sm font-medium leading-5 text-gray-700", {
					block: !hasSideLabel,
					"flex justify-between": hasSideLabel,
					// "text-red-600": !!error,
				})}
			>
				{label}
				{sideLabel ?? null}
			</label>
			<div className="mt-1 rounded-md shadow-sm">
				<input
					id={name}
					name={name}
					type={type}
					className={clsx("appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5", {
						"border-gray-300": !error,
						"border-red-300": error,
					})}
					required
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
};

export default LabeledTextField;
