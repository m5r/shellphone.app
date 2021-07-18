import type { FunctionComponent, MutableRefObject, ReactNode } from "react";
import { Fragment } from "react";
import { Transition, Dialog } from "@headlessui/react";

type Props = {
	initialFocus?: MutableRefObject<HTMLElement | null> | undefined;
	isOpen: boolean;
	onClose: () => void;
};

const Modal: FunctionComponent<Props> = ({
	children,
	initialFocus,
	isOpen,
	onClose,
}) => {
	return (
		<Transition.Root show={isOpen} as={Fragment}>
			<Dialog
				className="fixed z-30 inset-0 overflow-y-auto"
				initialFocus={initialFocus}
				onClose={onClose}
				open={isOpen}
				static
			>
				<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center md:block md:p-0">
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
					</Transition.Child>

					{/* This element is to trick the browser into centering the modal contents. */}
					<span className="hidden md:inline-block md:align-middle md:h-screen">
						&#8203;
					</span>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
						enterTo="opacity-100 translate-y-0 md:scale-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100 translate-y-0 md:scale-100"
						leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
					>
						<div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all md:my-8 md:align-middle md:max-w-lg md:w-full md:p-6">
							{children}
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	);
};

export const ModalTitle: FunctionComponent = ({ children }) => (
	<Dialog.Title
		as="h3"
		className="text-lg leading-6 font-medium text-gray-900"
	>
		{children}
	</Dialog.Title>
);

export default Modal;
