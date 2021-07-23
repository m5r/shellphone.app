import type { FunctionComponent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { useForm } from "react-hook-form";

import Toggle from "../toggle";
import Modal, { ModalTitle } from "../modal";

import useSubscription from "../../hooks/use-subscription";
import useUser from "../../hooks/use-user";

import type {
	Plan,
	PlanId,
	PlanName,
} from "../../subscription/plans";
import { FREE, PLANS } from "../../subscription/plans";

type Props = {
	activePlanId?: PlanId;
};

type Form = {
	selectedPlanName: PlanName;
};

const BillingPlans: FunctionComponent<Props> = ({ activePlanId = FREE.id }) => {
	const { customer } = useUser();
	const { subscribe, changePlan } = useSubscription();
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(
		false,
	);
	const modalCancelButtonRef = useRef<HTMLButtonElement>(null);
	const activePlan = useMemo(() => {
		const activePlan = PLANS[activePlanId];
		if (!activePlan) {
			return FREE;
		}

		return activePlan;
	}, [activePlanId]);
	const {
		register,
		unregister,
		handleSubmit,
		watch,
		setValue,
		formState: { isSubmitting },
	} = useForm<Form>({
		defaultValues: getDefaultValues(activePlan),
	});

	useEffect(() => {
		register("selectedPlanName");

		const { selectedPlanName } = getDefaultValues(activePlan);
		setValue("selectedPlanName", selectedPlanName);

		return () => {
			unregister("selectedPlanName");
		};
	}, [register, unregister, activePlan, setValue]);

	const plans = PLANS;
	const selectedPlanName = watch("selectedPlanName");
	const selectedPlan = useMemo(() => plans[selectedPlanName] ?? FREE, [
		plans,
		selectedPlanName,
	]);
	const isActivePlanSelected = activePlan.id === selectedPlan.id;
	const isSubmitDisabled = isSubmitting || isActivePlanSelected;

	const onSubmit = handleSubmit(() => setIsConfirmationModalOpen(true));
	const closeModal = () => setIsConfirmationModalOpen(false);
	const onConfirm = async () => {
		if (isSubmitDisabled) {
			return;
		}

		const email = customer!.email!;
		const userId = customer!.id;
		const selectedPlanId = selectedPlan.id;

		const isMovingToPaidPlan =
			activePlan.id === "free" && selectedPlanId !== "free";
		if (isMovingToPaidPlan) {
			await subscribe({ email, userId, planId: selectedPlanId });
		} else {
			await changePlan({ planId: selectedPlanId });
		}
	};

	return (
		<>
			<form onSubmit={onSubmit}>
				<div className="shadow sm:rounded-md sm:overflow-hidden">
					<div className="bg-white py-6 px-4 space-y-6 sm:p-6">
						<fieldset>
							<RadioGroup
								value={selectedPlan.name}
								onChange={(planName) => setValue("selectedPlanName", planName)}
								className="relative bg-white rounded-md -space-y-px"
							>
								{Object.entries(plans).map(
									([planId, plan], index, plansEntries) => {
										const isChecked = selectedPlan.id === planId;
										console.log("selectedPlan.name", selectedPlan.name);

										return (
											<RadioGroup.Option
												key={planId}
												value={planId}
												as="label"
												className={clsx(
													"relative border p-4 flex flex-col cursor-pointer md:pl-4 md:pr-6 md:grid md:grid-cols-3",
													{
														"rounded-tl-md rounded-tr-md": index === 0,
														"rounded-bl-md rounded-br-md": index === plansEntries.length - 1,
														"bg-primary-50 border-primary-200 z-10": isChecked,
														"border-gray-200": !isChecked,
													},
												)}
											>
												<div className="flex items-center text-sm">
													<input
														className="h-4 w-4 text-primary-500 border-gray-300"
														type="radio"
														value={planId}
														checked={isChecked}
														readOnly
													/>
													<span className="ml-3 font-medium text-gray-900">
														{plan.name}
													</span>
												</div>

												<p className="ml-6 pl-1 text-sm md:ml-0 md:pl-0">
													<span
														className={clsx(
															"font-medium",
															{
																"text-primary-900": isChecked,
																"text-gray-900": !isChecked,
															},
														)}
													>
														{plan.price === "free" ? (
															"Free "
														) : (
															<>
																${plan.price} /
																mo
															</>
														)}
													</span>
												</p>

												<p
													className={clsx(
														"ml-6 pl-1 text-sm md:ml-0 md:pl-0 md:text-right",
														{
															"text-primary-700": isChecked,
															"text-gray-500": !isChecked,
														},
													)}
												>
													{plan.description}
												</p>
											</RadioGroup.Option>
										);
									},
								)}
							</RadioGroup>
						</fieldset>
					</div>
					<div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
						<button
							type="submit"
							className={clsx(
								"transition-colors duration-150 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-900",
								{
									"bg-primary-400 cursor-not-allowed": isActivePlanSelected,
									"bg-primary-600 hover:bg-primary-700": !isActivePlanSelected,
								},
							)}
							disabled={isSubmitDisabled}
						>
							Save
						</button>
					</div>
				</div>
			</form>

			<Modal
				initialFocus={modalCancelButtonRef}
				isOpen={isConfirmationModalOpen}
				onClose={closeModal}
			>
				<div className="md:flex md:items-start">
					<div className="mt-3 text-center md:mt-0 md:ml-4 md:text-left">
						<ModalTitle>
							Move to {selectedPlan.name} plan
						</ModalTitle>
						<div className="mt-2">
							<p className="text-sm text-gray-500">
								Are you sure you want to move to{" "}
								{selectedPlan.name} plan?{" "}
							</p>
							{activePlan.name === "Team" &&
							selectedPlan.name !== "Team" ? (
								<p className="mt-2 text-sm font-medium text-gray-500">
									Attention: moving to a smaller plan will
									cause to remove extraneous team members to
									fit the new plan&apos;s allowance!
								</p>
							) : null}
						</div>
					</div>
				</div>
				<div className="mt-5 md:mt-4 md:flex md:flex-row-reverse">
					<button
						type="button"
						className={clsx(
							"transition-colors duration-150 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:ml-3 md:w-auto md:text-sm",
							{
								"bg-primary-400 cursor-not-allowed": isSubmitDisabled,
								"bg-primary-600 hover:bg-primary-700": !isSubmitDisabled,
							},
						)}
						onClick={onConfirm}
						disabled={isSubmitting}
					>
						Move to {selectedPlan.name} plan
					</button>
					<button
						ref={modalCancelButtonRef}
						type="button"
						className={clsx(
							"transition-colors duration-150 mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:mt-0 md:w-auto md:text-sm",
							{
								"bg-gray-50 cursor-not-allowed": isSubmitDisabled,
								"hover:bg-gray-50": !isSubmitDisabled,
							},
						)}
						onClick={closeModal}
						disabled={isSubmitting}
					>
						Cancel
					</button>
				</div>
			</Modal>
		</>
	);
};

const getDefaultValues = (activePlan: Plan) => ({
	selectedPlanName: activePlan.name.toLowerCase(),
});

export default BillingPlans;
