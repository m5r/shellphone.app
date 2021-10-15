import { IoCreateOutline, IoMailOutline } from "react-icons/io5";
import { useAtom } from "jotai";

import { bottomSheetOpenAtom } from "../pages/messages";

export default function EmptyMessages() {
	const setIsBottomSheetOpen = useAtom(bottomSheetOpenAtom)[1];
	const openNewMessageArea = () => setIsBottomSheetOpen(true);

	return (
		<div className="text-center my-auto">
			<IoMailOutline className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
			<h3 className="mt-2 text-sm font-medium text-gray-900">You don&#39;t have any messages yet</h3>
			<p className="mt-1 text-sm text-gray-500">
				Get started by sending a message
				<br />
				to someone you know.
			</p>
			<div className="mt-6">
				<button
					type="button"
					className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#007AFF] focus:outline-none focus:ring-2 focus:ring-offset-2"
					onClick={openNewMessageArea}
				>
					<IoCreateOutline className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
					Type a new message
				</button>
			</div>
		</div>
	);
}
