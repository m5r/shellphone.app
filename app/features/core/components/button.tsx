import type { ButtonHTMLAttributes, FunctionComponent } from "react";
import { useTransition } from "@remix-run/react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

const Button: FunctionComponent<Props> = ({ children, ...props }) => {
	const transition = useTransition();

	return (
		<button
			className={clsx(
				"w-full flex justify-center py-2 px-4 border border-transparent text-base font-medium rounded-md text-white focus:outline-none focus:border-primary-700 focus:shadow-outline-primary transition duration-150 ease-in-out",
				{
					"bg-primary-400 cursor-not-allowed": transition.state === "submitting",
					"bg-primary-600 hover:bg-primary-700": transition.state !== "submitting",
				},
			)}
			{...props}
		>
			{children}
		</button>
	);
}

export default Button;
