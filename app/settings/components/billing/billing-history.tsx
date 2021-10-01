import useSubscription from "../../hooks/use-subscription";

export default function BillingHistory() {
	const { payments } = useSubscription();

	return (
		<section>
			<div className="bg-white pt-6 shadow sm:rounded-md sm:overflow-hidden">
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
										{typeof payments !== "undefined"
											? payments.map((payment) => (
													<tr key={payment.id}>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
															<time>{new Date(payment.payout_date).toDateString()}</time>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{payment.amount} {payment.currency}
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
											  ))
											: null}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
