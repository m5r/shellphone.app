import type { ElementType } from "react";
import { Switch } from "@headlessui/react";
import clsx from "clsx";
import Alert from "~/features/core/components/alert";

type Props = {
	as?: ElementType;
	checked: boolean;
	description?: string;
	onChange(checked: boolean): void;
	title: string;
	error: null | {
		title: string;
		message: string;
	};
	isLoading?: true;
};

export default function Toggle({ as, checked, description, onChange, title, error, isLoading }: Props) {
	return (
		<Switch.Group as={as} className="py-4 space-y-2 flex flex-col items-center justify-between">
			<div className="flex w-full items-center justify-between">
				<div className="flex flex-col">
					<Switch.Label as="p" className="text-sm font-medium text-gray-900" passive>
						{title}
					</Switch.Label>
					{description && (
						<Switch.Description as="span" className="text-sm text-gray-500">
							{description}
						</Switch.Description>
					)}
				</div>
				{isLoading ? (
					<div className="w-11 ml-4 flex-shrink-0">
						<Loader />
					</div>
				) : (
					<Switch
						checked={checked}
						onChange={onChange}
						className={clsx(
							checked ? "bg-primary-500" : "bg-gray-200",
							"ml-4 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500",
						)}
					>
						<span
							aria-hidden="true"
							className={clsx(
								checked ? "translate-x-5" : "translate-x-0",
								"inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200",
							)}
						/>
					</Switch>
				)}
			</div>
			{error !== null && <Alert title={error.title} message={error.message} variant="error" />}
		</Switch.Group>
	);
}

function Loader() {
	return (
		<svg
			className="animate-spin h-5 w-5 text-primary-700"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
}
