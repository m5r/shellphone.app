type Payment = {
	id: number;
	subscription_id: number;
	amount: number;
	currency: string;
	payout_date: string;
	is_paid: number;
	is_one_off_charge: boolean;
	receipt_url?: string;
};

export default function usePaymentsHistory() {
	const payments: Payment[] = [];
	const count = 0;
	const skip = 0;
	const pagesNumber = [1];
	const currentPage = 0;
	const lastPage = 0;
	const hasPreviousPage = false;
	const hasNextPage = false;
	const goToPreviousPage = () => void 0;
	const goToNextPage = () => void 0;
	const setPage = (page: number) => void 0;

	return {
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
	};
}