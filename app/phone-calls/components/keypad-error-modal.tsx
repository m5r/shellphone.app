import type { FunctionComponent } from "react";
import { useRef } from "react";
import { Link, Routes, useRouter } from "blitz";

import Modal, { ModalTitle } from "app/core/components/modal";

type Props = {
	isOpen: boolean;
	closeModal: () => void;
};

const KeypadErrorModal: FunctionComponent<Props> = ({ isOpen, closeModal }) => {
	const openSettingsButtonRef = useRef<HTMLButtonElement>(null);
	const router = useRouter();

	return (
		<Modal initialFocus={openSettingsButtonRef} isOpen={isOpen} onClose={closeModal}>
			<div className="md:flex md:items-start">
				<div className="mt-3 text-center md:mt-0 md:ml-4 md:text-left">
					<ModalTitle>Woah, hold on! Set up your &#128026;phone number first</ModalTitle>
					<div className="mt-2 text-gray-500">
						<p>
							First things first. Head over to your{" "}
							<Link href={Routes.PhoneSettings()}>
								<a className="underline">phone settings</a>
							</Link>{" "}
							to set up your phone number.
						</p>
					</div>
				</div>
			</div>
			<div className="mt-5 md:mt-4 md:flex md:flex-row-reverse">
				<button
					ref={openSettingsButtonRef}
					type="button"
					className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-primary-500 font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:mt-0 md:w-auto"
					onClick={() => router.push(Routes.PhoneSettings())}
				>
					Take me there
				</button>
				<button
					type="button"
					className="md:mr-2 mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:mt-0 md:w-auto"
					onClick={closeModal}
				>
					I got it, thanks!
				</button>
			</div>
		</Modal>
	);
};

export default KeypadErrorModal;
