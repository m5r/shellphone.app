import { XIcon } from "@heroicons/react/outline";

export default function ReferralBanner() {
	// TODO
	const isDisabled = true;
	if (isDisabled) {
		return null;
	}

	return (
		<div className="relative bg-primary-600">
			<div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
				<div className="pr-16 sm:text-center sm:px-16">
					<p className="font-medium text-white">
						<span>&#127881; New: Get one month free for every friend that joins and subscribe!</span>
						<span className="block sm:ml-2 sm:inline-block">
							<a href="#" className="text-white font-bold underline">
								{" "}
								Learn more <span aria-hidden="true">&rarr;</span>
							</a>
						</span>
					</p>
				</div>
				<div className="absolute inset-y-0 right-0 pt-1 pr-1 flex items-start sm:pt-1 sm:pr-2 sm:items-start">
					<button
						type="button"
						className="flex p-2 rounded-md hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-white"
					>
						<span className="sr-only">Dismiss</span>
						<XIcon className="h-6 w-6 text-white" aria-hidden="true" />
					</button>
				</div>
			</div>
		</div>
	);
}
