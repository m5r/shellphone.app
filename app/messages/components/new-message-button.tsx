import type { FunctionComponent, MouseEventHandler } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/pro-regular-svg-icons";

type Props = {
	onClick: MouseEventHandler<HTMLButtonElement>;
};

const NewMessageButton: FunctionComponent<Props> = ({ onClick }) => {
	return (
		<button
			onClick={onClick}
			className="absolute bottom-20 right-6
			w-14 h-14 bg-gray-800 rounded-full hover:bg-gray-900 active:shadow-lg shadow transition ease-in duration-200 focus:outline-none"
		>
			<FontAwesomeIcon size="lg" className="m-auto pl-1.5 text-white w-8 h-8" icon={faEdit} />
		</button>
	);
};

export default NewMessageButton;
