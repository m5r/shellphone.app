import type { FunctionComponent } from "react";
import { useRef } from "react";

import Modal, { ModalTitle } from "~/features/core/components/modal";

type Props = {
	isHelpModalOpen: boolean;
	closeModal: () => void;
};

const HelpModal: FunctionComponent<Props> = ({ isHelpModalOpen, closeModal }) => {
	const modalCloseButtonRef = useRef<HTMLButtonElement>(null);
	return (
		<Modal initialFocus={modalCloseButtonRef} isOpen={isHelpModalOpen} onClose={closeModal}>
			<div className="md:flex md:items-start">
				<div className="mt-3 text-center md:mt-0 md:ml-4 md:text-left">
					<ModalTitle>Need help finding your Twilio credentials?</ModalTitle>
					<div className="mt-6 space-y-3 text-gray-500">
						<p>
							You can check out our{" "}
							<a className="underline" href="https://docs.shellphone.app/guide/getting-started">
								getting started
							</a>{" "}
							guide to set up your account with your Twilio credentials.
						</p>
						<p>
							If you feel stuck, pick a date & time on{" "}
							<a className="underline" href="https://calendly.com/shellphone-onboarding">
								our calendly
							</a>{" "}
							and we will help you get started!
						</p>
						<p>
							Don&#39;t miss out on free $10 Twilio credit by using{" "}
							<a className="underline" href="https://www.twilio.com/referral/gNvX8p">
								our referral link
							</a>
							.
						</p>
					</div>
				</div>
			</div>
			<div className="mt-5 md:mt-4 md:flex md:flex-row-reverse">
				<button
					ref={modalCloseButtonRef}
					type="button"
					className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-primary-500 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:mt-0 md:w-auto"
					onClick={closeModal}
				>
					Noted, thanks the help!
				</button>
			</div>
		</Modal>
	);
};

export default HelpModal;
