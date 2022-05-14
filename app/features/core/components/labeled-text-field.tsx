import type { FunctionComponent, InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Props = {
	name: string;
	label: ReactNode;
	sideLabel?: ReactNode;
	type?: "text" | "password" | "email";
	error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const LabeledTextField: FunctionComponent<Props> = ({ name, label, sideLabel, type = "text", error, ...props }) => {
	const hasSideLabel = !!sideLabel;

	return (
		<div className="mb-6">
			<label
				htmlFor={name}
				className={clsx("text-sm font-medium leading-5 text-gray-700", {
					block: !hasSideLabel,
					"flex justify-between": hasSideLabel,
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
					className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-primary focus:border-primary-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
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
