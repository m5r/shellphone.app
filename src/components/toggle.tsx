import type { FunctionComponent, ReactNode } from "react";
import { Switch } from "@headlessui/react";
import clsx from "clsx";

type Props = {
	isChecked: boolean;
	label?: ReactNode;
	onChange: (checked: boolean) => void;
};

const Toggle: FunctionComponent<Props> = ({ isChecked, label, onChange }) => {
	return (
		<Switch.Group as="div" className="flex items-center space-x-4">
			<Switch
				as="button"
				checked={isChecked}
				onChange={onChange}
				className={clsx(
					"relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer focus:outline-none ring-0 transition-colors ease-in-out duration-200",
					{
						"bg-primary-500": isChecked,
						"bg-gray-200": !isChecked,
					},
				)}
			>
				{({ checked }) => (
					<span
						className={`${
							checked ? "translate-x-5" : "translate-x-0"
						} inline-block w-5 h-5 transition duration-200 ease-in-out transform bg-white rounded-full shadow ring-0`}
					/>
				)}
			</Switch>
			{label ? (
				<Switch.Label className="ml-3">{label}</Switch.Label>
			) : null}
		</Switch.Group>
	);
};

export default Toggle;
