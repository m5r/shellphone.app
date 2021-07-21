import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import type { Message } from "../database/message";
import useUser from "./use-user";

type UseConversationParams = {
	initialData?: Message[];
	recipient: string;
}

export default function useConversation({
	initialData,
	recipient,
}: UseConversationParams) {
	const user = useUser();
	const getConversationUrl = `/api/conversation/${encodeURIComponent(recipient)}`;
	const fetcher = async () => {
		const { data } = await axios.get<Message[]>(getConversationUrl);
		return data;
	};
	const queryClient = useQueryClient();
	const getConversationQuery = useQuery<Message[]>(
		getConversationUrl,
		fetcher,
		{
			initialData,
			refetchInterval: false,
			refetchOnWindowFocus: false,
		},
	);

	const sendMessage = useMutation(
		(sms: Pick<Message, "to" | "content">) => axios.post(`/api/conversation/${sms.to}/send-message`, sms, { withCredentials: true }),
		{
			onMutate: async (sms: Pick<Message, "to" | "content">) => {
				await queryClient.cancelQueries(getConversationUrl);
				const previousMessages = queryClient.getQueryData<Message[]>(getConversationUrl);

				if (previousMessages) {
					queryClient.setQueryData<Message[]>(getConversationUrl, [
						...previousMessages,
						{
							id: "", // TODO: somehow generate an id
							from: "", // TODO: get user's phone number
							customerId: user.userProfile!.id,
							sentAt: new Date().toISOString(),
							direction: "outbound",
							status: "queued",
							content: sms.content,
							to: sms.to,
						},
					]);
				}

				return { previousMessages };
			},
			onError: (error, variables, context) => {
				if (context?.previousMessages) {
					queryClient.setQueryData<Message[]>(getConversationUrl, context.previousMessages);
				}
			},
			onSettled: () => queryClient.invalidateQueries(getConversationUrl),
		},
	);

	return {
		conversation: getConversationQuery.data,
		error: getConversationQuery.error,
		refetch: getConversationQuery.refetch,
		sendMessage,
	};
}
