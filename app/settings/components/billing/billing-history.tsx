import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import clsx from "clsx";

import usePaymentsHistory from "../../hooks/use-payments-history";

export default function BillingHistory() {
	const {
		payments,
		count,
		skip,
		pagesNumber,
		currentPage,
		lastPage,
		hasPreviousPage,
		hasNextPage,
		goToPreviousPage,
		goToNextPage,
		setPage,
	} = usePaymentsHistory();

	if (payments.length === 0) {
		return null;
	}

	return (
		<section className="bg-white pt-6 shadow sm:rounded-md sm:overflow-hidden">
			<div className="px-4 sm:px-6">
				<h2 className="text-lg leading-6 font-medium text-gray-900">Billing history</h2>
			</div>
			<div className="mt-6 flex flex-col">
				<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
						<div className="overflow-hidden border-t border-gray-200">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Date
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Amount
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Status
										</th>
										<th
											scope="col"
											className="relative px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											<span className="sr-only">View receipt</span>
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{payments.map((payment) => (
										<tr key={payment.id}>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												<time>{new Date(payment.payout_date).toDateString()}</time>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{Intl.NumberFormat(undefined, {
													style: "currency",
													currency: payment.currency,
													currencyDisplay: "narrowSymbol",
												}).format(payment.amount)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{payment.is_paid === 1 ? "Paid" : "Upcoming"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
												{typeof payment.receipt_url !== "undefined" ? (
													<a
														href={payment.receipt_url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-primary-600 hover:text-primary-900"
													>
														View receipt
													</a>
												) : null}
											</td>
										</tr>
									))}
								</tbody>
							</table>

							<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
								<div className="flex-1 flex justify-between sm:hidden">
									<button
										onClick={goToPreviousPage}
										className={clsx(
											"relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",
											!hasPreviousPage && "invisible",
										)}
									>
										Previous
									</button>
									<p className="text-sm text-gray-700 self-center">
										Page <span className="font-medium">{currentPage}</span> of{" "}
										<span className="font-medium">{lastPage}</span>
									</p>
									<button
										onClick={goToNextPage}
										className={clsx(
											"ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50",
											!hasNextPage && "invisible",
										)}
									>
										Next
									</button>
								</div>
								<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
									<div>
										<p className="text-sm text-gray-700">
											Showing <span className="font-medium">{skip + 1}</span> to{" "}
											<span className="font-medium">{skip + payments.length}</span> of{" "}
											<span className="font-medium">{count}</span> results
										</p>
									</div>
									<div>
										<nav
											className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
											aria-label="Pagination"
										>
											<button
												onClick={goToPreviousPage}
												className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
											>
												<span className="sr-only">Previous</span>
												<IoChevronBack className="h-5 w-5" aria-hidden="true" />
											</button>
											{pagesNumber.map((pageNumber) => (
												<button
													key={`billing-history-button-page-${pageNumber}`}
													onClick={() => setPage(pageNumber)}
													className={clsx(
														"relative inline-flex items-center px-4 py-2 border text-sm font-medium",
														pageNumber === currentPage
															? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
															: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50",
													)}
												>
													{pageNumber}
												</button>
											))}
											<button
												onClick={goToNextPage}
												className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
											>
												<span className="sr-only">Next</span>
												<IoChevronForward className="h-5 w-5" aria-hidden="true" />
											</button>
										</nav>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
