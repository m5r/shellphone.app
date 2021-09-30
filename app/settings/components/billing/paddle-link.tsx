import type { FunctionComponent, MouseEventHandler } from "react";
import { HiExternalLink } from "react-icons/hi";

type Props = {
	onClick: MouseEventHandler<HTMLButtonElement>;
	text: string;
};

const PaddleLink: FunctionComponent<Props> = ({ onClick, text }) => (
	<button className="flex space-x-2 items-center text-left" onClick={onClick}>
		<HiExternalLink className="w-6 h-6 flex-shrink-0" />
		<span className="transition-colors duration-150 border-b border-transparent hover:border-primary-500">
			{text}
		</span>
	</button>
);

export default PaddleLink;
