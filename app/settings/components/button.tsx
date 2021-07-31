import type { ButtonHTMLAttributes, FunctionComponent, MouseEventHandler } from "react";
import clsx from "clsx";

type Props = {
	variant: Variant;
	onClick?: MouseEventHandler;
	isDisabled?: boolean;
	type: ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

const Button: FunctionComponent<Props> = ({ children, type, variant, onClick, isDisabled }) => {
	return (
		<button
			onClick={onClick}
			type={type}
			className={clsx(
				"inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2",
				{
					[VARIANTS_STYLES[variant].base]: !isDisabled,
					[VARIANTS_STYLES[variant].disabled]: isDisabled,
				}
			)}
			disabled={isDisabled}
		>
			{children}
		</button>
	);
};

export default Button;

type Variant = "error" | "default";

type VariantStyle = {
	base: string;
	disabled: string;
};

const VARIANTS_STYLES: Record<Variant, VariantStyle> = {
	error: {
		base: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
		disabled: "bg-red-400 cursor-not-allowed focus:ring-red-500",
	},
	default: {
		base: "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500",
		disabled: "bg-primary-400 cursor-not-allowed focus:ring-primary-500",
	},
};
