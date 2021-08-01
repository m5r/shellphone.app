import { useQuery } from "blitz";
import getConversationsQuery from "../queries/get-conversations";

export default function useKnownRecipients() {
	return useQuery(
		getConversationsQuery,
		{},
		{
			select(conversations) {
				return Object.keys(conversations);
			},
		}
	);
}
