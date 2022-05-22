import { IoCall } from "react-icons/io5";

import Keypad from "~/features/keypad/components/keypad";

export default function BlurredKeypad() {
	return (
		<div className="filter blur-sm select-none absolute top-0 w-full h-full z-0">
			<section className="relative w-96 h-full flex flex-col justify-around mx-auto py-5 text-center">
				<div className="h-16 text-3xl text-gray-700" />
				<Keypad>
					<button className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-green-800 rounded-full">
						<IoCall className="w-6 h-6 text-white" />
					</button>
				</Keypad>
			</section>
		</div>
	);
}
