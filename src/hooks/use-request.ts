import type { AxiosError } from "axios";
import axios from "axios";
import type { UseQueryOptions } from "react-query";
import { useQuery } from "react-query";

import type { ApiError } from "../pages/api/_types";

export default function useRequest<
	TData = unknown,
	TError = AxiosError<ApiError>
>(url: string, options?: UseQueryOptions<TData, TError>) {
	const query = createQuery<TData>(url);

	return useQuery<TData, TError>(url, query, options);
}

function createQuery<T = any>(url: string) {
	return async function query() {
		const { data } = await axios.get<T>(url);
		return data;
	};
}
