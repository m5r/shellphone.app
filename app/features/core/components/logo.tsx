import type { FunctionComponent } from "react";

type Props = {
	className?: string;
};

const Logo: FunctionComponent<Props> = ({ className }) => (
	<div className={className}>
		<img src="/shellphone.webp" alt="app logo" />
	</div>
);

export default Logo;
