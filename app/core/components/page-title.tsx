import type { FunctionComponent } from "react";
import clsx from "clsx";

type Props = {
	className?: string;
	title: string;
};

const PageTitle: FunctionComponent<Props> = ({ className, title }) => {
	return (
		<div className={clsx(className, "flex flex-col space-y-6 p-3")}>
			<h2 className="text-3xl font-bold">{title}</h2>
		</div>
	);
};

export default PageTitle;
