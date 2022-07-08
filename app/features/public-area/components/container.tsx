import type { HTMLAttributes } from "react";
import clsx from "clsx";

type Props = HTMLAttributes<HTMLDivElement> & {
	className?: string;
};

export default function Container({ className, ...props }: Props) {
	return <div className={clsx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}
