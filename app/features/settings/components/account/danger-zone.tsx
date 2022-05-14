import { useRef, useState } from "react";
import clsx from "clsx";

import Button from "../button";
import SettingsSection from "../settings-section";
import Modal, { ModalTitle } from "~/features/core/components/modal";

export default function DangerZone() {
	const [isDeletingUser, setIsDeletingUser] = useState(false);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const modalCancelButtonRef = useRef<HTMLButtonElement>(null);

	const closeModal = () => {
		if (isDeletingUser) {
			return;
		}

		setIsConfirmationModalOpen(false);
	};
	const onConfirm = () => {
		setIsDeletingUser(true);
		// return deleteUserMutation(); // TODO
	};

	return (
		<SettingsSection className="border border-red-300">
			<div className="flex justify-between items-center flex-row space-x-2">
				<p>
					Once you delete your account, all of its data will be permanently deleted and any ongoing
					subscription will be cancelled.
				</p>

				<span className="text-base font-medium">
					<Button variant="error" type="button" onClick={() => setIsConfirmationModalOpen(true)}>
						Delete my account
					</Button>
				</span>
			</div>

			<Modal initialFocus={modalCancelButtonRef} isOpen={isConfirmationModalOpen} onClose={closeModal}>
				<div className="md:flex md:items-start">
					<div className="mt-3 text-center md:mt-0 md:ml-4 md:text-left">
						<ModalTitle>Delete my account</ModalTitle>
						<div className="mt-2 text-sm text-gray-500">
							<p>
								Are you sure you want to delete your account? Your subscription will be cancelled and
								your data permanently deleted.
							</p>
							<p>
								You are free to create a new account with the same email address if you ever wish to
								come back.
							</p>
						</div>
					</div>
				</div>
				<div className="mt-5 md:mt-4 md:flex md:flex-row-reverse">
					<button
						type="button"
						className={clsx(
							"transition-colors duration-150 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 md:ml-3 md:w-auto md:text-sm",
							{
								"bg-red-400 cursor-not-allowed": isDeletingUser,
								"bg-red-600 hover:bg-red-700": !isDeletingUser,
							},
						)}
						onClick={onConfirm}
						disabled={isDeletingUser}
					>
						Delete my account
					</button>
					<button
						ref={modalCancelButtonRef}
						type="button"
						className={clsx(
							"transition-colors duration-150 mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:mt-0 md:w-auto md:text-sm",
							{
								"bg-gray-50 cursor-not-allowed": isDeletingUser,
								"hover:bg-gray-50": !isDeletingUser,
							},
						)}
						onClick={closeModal}
						disabled={isDeletingUser}
					>
						Cancel
					</button>
				</div>
			</Modal>
		</SettingsSection>
	);
}
