import type { FunctionComponent, ReactNode, PropsWithChildren } from "react";
import clsx from "clsx";

type Props = {
	className?: string;
	footer?: ReactNode;
};

const SettingsSection: FunctionComponent<PropsWithChildren<Props>> = ({ children, footer, className }) => (
	<section className={clsx(className, "shadow sm:rounded-md sm:overflow-hidden")}>
		<div className="bg-white space-y-6 py-6 px-4 sm:p-6">{children}</div>
		{footer ?? null}
	</section>
);

export default SettingsSection;
