import type { FunctionComponent } from "react";

type Props = {
	name: string;
};

const Avatar: FunctionComponent<Props> = ({ name }) => (
	<span className="inline-flex items-center justify-center w-8 h-8 flex-none rounded-full bg-gray-400 group-hover:opacity-75">
		<span className="text-sm leading-none text-white uppercase">
			{name.substr(0, 2)}
		</span>
	</span>
);

export default Avatar;
