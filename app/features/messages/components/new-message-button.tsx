import type { FunctionComponent, MouseEventHandler } from "react";
import { IoCreateOutline } from "react-icons/io5";

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
			<IoCreateOutline className="m-auto pl-0.5 text-white w-8 h-8" />
		</button>
	);
};

export default NewMessageButton;
