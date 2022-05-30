import useAppLoaderData from "~/features/core/hooks/use-app-loader-data";

export default function useSession() {
	return useAppLoaderData().sessionData;
}
