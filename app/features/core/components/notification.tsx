import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Transition } from "@headlessui/react";
import { useAtom } from "jotai";

import useNotifications, { notificationDataAtom } from "~/features/core/hooks/use-notifications";

export default function Notification() {
	useNotifications();
	const navigate = useNavigate();
	const [notificationData] = useAtom(notificationDataAtom);
	const [show, setShow] = useState(notificationData !== null);
	const close = () => setShow(false);
	const actions = buildActions();

	useEffect(() => {
		setShow(notificationData !== null);
	}, [notificationData]);

	return (
		<div aria-live="assertive" className="fixed inset-0 flex items-start px-4 py-6 pointer-events-none sm:p-6">
			<div className="w-full flex flex-col items-center space-y-4 sm:items-end">
				{/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
				<Transition
					show={show}
					as={Fragment}
					enter="transform ease-out duration-300 transition"
					enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
					enterTo="translate-y-0 opacity-100 sm:translate-x-0"
					leave="transition ease-in duration-100"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 divide-x divide-gray-200">
						<div className="w-0 flex-1 flex items-center p-4">
							<div className="w-full">
								<p className="text-sm font-medium text-gray-900">{notificationData?.data.recipient}</p>
								<p className="mt-1 text-sm text-gray-500">{notificationData?.body}</p>
							</div>
						</div>
						<div className="flex">
							<div className="flex flex-col divide-y divide-gray-200">
								<div className="h-0 flex-1 flex">
									<button
										type="button"
										className="w-full border border-transparent rounded-none rounded-tr-lg px-4 py-3 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:z-10 focus:ring-2 focus:ring-indigo-500"
										onClick={actions[0].onClick}
									>
										{actions[0].title}
									</button>
								</div>
								<div className="h-0 flex-1 flex">
									<button
										type="button"
										className="w-full border border-transparent rounded-none rounded-br-lg px-4 py-3 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
										onClick={actions[1].onClick}
									>
										{actions[1].title}
									</button>
								</div>
							</div>
						</div>
					</div>
				</Transition>
			</div>
		</div>
	);

	function buildActions() {
		if (!notificationData) {
			return [
				{ title: "", onClick: close },
				{ title: "", onClick: close },
			];
		}

		return {
			message: [
				{
					title: "Reply",
					onClick: () => {
						navigate(`/messages/${encodeURIComponent(notificationData.data.recipient)}`);
						close();
					},
				},
				{ title: "Close", onClick: close },
			],
			call: [
				{ title: "Answer", onClick: close },
				{ title: "Decline", onClick: close },
			],
		}[notificationData.data.type];
	}
}