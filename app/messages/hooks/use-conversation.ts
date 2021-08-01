import { useQuery } from "blitz";

import getConversationsQuery from "../queries/get-conversations";

export default function useConversation(recipient: string) {
	return useQuery(
		getConversationsQuery,
		{},
		{
			select(conversations) {
				if (!conversations[recipient]) {
					return [];
				}

				return conversations[recipient]!;
			},
			keepPreviousData: true,
		},
	);
}
