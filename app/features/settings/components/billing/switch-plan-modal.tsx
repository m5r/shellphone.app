import type { FunctionComponent } from "react";
import { useRef } from "react";

import Modal, { ModalTitle } from "~/features/core/components/modal";
import type { Plan } from "./plans";

type Props = {
	isOpen: boolean;
	nextPlan: Plan | null;
	confirm: (nextPlan: Plan) => void;
	closeModal: () => void;
};

const SwitchPlanModal: FunctionComponent<Props> = ({ isOpen, nextPlan, confirm, closeModal }) => {
	const confirmButtonRef = useRef<HTMLButtonElement>(null);

	return (
		<Modal initialFocus={confirmButtonRef} isOpen={isOpen} onClose={closeModal}>
			<div className="md:flex md:items-start">
				<div className="mt-3 text-center md:mt-0 md:ml-4 md:text-left">
					<ModalTitle>Are you sure you want to switch to {nextPlan?.title}?</ModalTitle>
					<div className="mt-2 text-gray-500">
						<p>
							You&#39;re about to switch to the <strong>{nextPlan?.title}</strong> plan. You will be
							billed immediately a prorated amount and the next billing date will be recalculated from
							today.
						</p>
					</div>
				</div>
			</div>
			<div className="mt-5 md:mt-4 md:flex md:flex-row-reverse">
				<button
					ref={confirmButtonRef}
					type="button"
					className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-primary-500 font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:mt-0 md:w-auto"
					onClick={() => confirm(nextPlan!)}
				>
					Yes, I&#39;m sure
				</button>
				<button
					type="button"
					className="md:mr-2 mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:mt-0 md:w-auto"
					onClick={closeModal}
				>
					Nope, cancel it
				</button>
			</div>
		</Modal>
	);
};

export default SwitchPlanModal;
