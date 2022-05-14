import { useNavigate } from "@remix-run/react";
import { IoSettings, IoAlertCircleOutline } from "react-icons/io5";

export default function InactiveSubscription() {
	const navigate = useNavigate();

	return (
		<div className="flex items-end justify-center min-h-full overflow-y-hidden pt-4 px-4 pb-4 text-center md:block md:p-0 z-10">
			<span className="hidden md:inline-block md:align-middle md:h-screen">&#8203;</span>
			<div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all md:my-8 md:align-middle md:max-w-lg md:w-full md:p-6">
				<div className="text-center my-auto p-4">
					<IoAlertCircleOutline className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						You don&#39;t have any active subscription
					</h3>
					<p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto break-normal whitespace-normal">
						You need an active subscription to use this feature.
						<br />
						Head over to your settings to pick up a plan.
					</p>
					<div className="mt-6">
						<button
							type="button"
							className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2"
							onClick={() => navigate("/settings/billing")}
						>
							<IoSettings className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
							Choose a plan
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
