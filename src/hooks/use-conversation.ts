import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import type { Sms } from "../database/_types";
import { SmsType } from "../database/_types";
import useUser from "./use-user";

type UseConversationParams = {
	initialData?: Sms[];
	recipient: string;
}

export default function useConversation({
	initialData,
	recipient,
}: UseConversationParams) {
	const user = useUser();
	const getConversationUrl = `/api/conversation/${encodeURIComponent(recipient)}`;
	const fetcher = async () => {
		const { data } = await axios.get<Sms[]>(getConversationUrl);
		return data;
	};
	const queryClient = useQueryClient();
	const getConversationQuery = useQuery<Sms[]>(
		getConversationUrl,
		fetcher,
		{
			initialData,
			refetchInterval: false,
			refetchOnWindowFocus: false,
		},
	);

	const sendMessage = useMutation(
		(sms: Pick<Sms, "to" | "content">) => axios.post(`/api/conversation/${sms.to}/send-message`, sms, { withCredentials: true }),
		{
			onMutate: async (sms: Pick<Sms, "to" | "content">) => {
				await queryClient.cancelQueries(getConversationUrl);
				const previousMessages = queryClient.getQueryData<Sms[]>(getConversationUrl);

				if (previousMessages) {
					queryClient.setQueryData<Sms[]>(getConversationUrl, [
						...previousMessages,
						{
							id: "", // TODO: somehow generate an id
							from: "", // TODO: get user's phone number
							customerId: user.userProfile!.id,
							sentAt: new Date().toISOString(),
							type: SmsType.SENT,
							content: sms.content,
							to: sms.to,
						},
					]);
				}

				return { previousMessages };
			},
			onError: (error, variables, context) => {
				if (context?.previousMessages) {
					queryClient.setQueryData<Sms[]>(getConversationUrl, context.previousMessages);
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
