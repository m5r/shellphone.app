import { useState } from "react";
import { usePaginatedQuery } from "blitz";

import getPayments from "../queries/get-payments";

const itemsPerPage = 5;

export default function usePaymentsHistory() {
	const [skip, setSkip] = useState(0);
	const [{ payments, hasMore, nextPage, count }] = usePaginatedQuery(getPayments, { skip, take: itemsPerPage });

	const totalPages = Math.ceil(count / itemsPerPage);
	const pagesNumber = Array(totalPages)
		.fill(-1)
		.map((_, i) => i + 1);
	const currentPage = Math.floor((skip / count) * totalPages) + 1;
	const hasPreviousPage = skip > 0;
	const hasNextPage = hasMore && !!nextPage;
	const goToPreviousPage = () => hasPreviousPage && setSkip(skip - itemsPerPage);
	const goToNextPage = () => hasNextPage && setSkip(nextPage.skip);
	const setPage = (pageNumber: number) => setSkip((pageNumber - 1) * itemsPerPage);

	return {
		payments,
		count,
		skip,
		pagesNumber,
		currentPage,
		hasPreviousPage,
		hasNextPage,
		goToPreviousPage,
		goToNextPage,
		setPage,
	};
}
