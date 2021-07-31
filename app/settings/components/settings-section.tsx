import type { FunctionComponent, ReactNode } from "react";

type Props = {
	title: string;
	description?: ReactNode;
};

const SettingsSection: FunctionComponent<Props> = ({ children, title, description }) => (
	<div className="px-4 sm:px-6 md:px-0 lg:grid lg:grid-cols-4 lg:gap-6">
		<div className="lg:col-span-1">
			<h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
			{description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
		</div>
		<div className="mt-5 lg:mt-0 lg:col-span-3">{children}</div>
	</div>
);

export default SettingsSection;
