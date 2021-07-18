import type { FunctionComponent } from "react";
import Image from "next/image";
import clsx from "clsx";

type Props = {
	className?: string;
};

const Logo: FunctionComponent<Props> = ({ className }) => (
	<div className={clsx("relative", className)}>
		<Image src="/static/logo.svg" layout="fill" alt="app logo" />
	</div>
);

export default Logo;
