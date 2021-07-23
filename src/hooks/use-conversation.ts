import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { useAtom } from "jotai";

import type { Message } from "../database/message";
import useUser from "./use-user";
import { conversationsAtom, customerAtom, customerPhoneNumberAtom } from "../state";
import { useEffect } from "react";

export default function useConversation(recipient: string) {
	const customer = useAtom(customerAtom)[0];
	const customerPhoneNumber = useAtom(customerPhoneNumberAtom)[0];
	const getConversationUrl = `/api/conversation/${encodeURIComponent(recipient)}`;
	const fetcher = async () => {
		const { data } = await axios.get<Message[]>(getConversationUrl);
		return data;
	};
	const queryClient = useQueryClient();
	const [conversations] = useAtom(conversationsAtom);
	const getConversationQuery = useQuery<Message[] | null>(
		getConversationUrl,
		fetcher,
		{
			initialData: null,
			refetchInterval: false,
			refetchOnWindowFocus: false,
		},
	);

	useEffect(() => {
		const conversation = conversations[recipient];
		if (getConversationQuery.data?.length === 0) {
			queryClient.setQueryData(getConversationUrl, conversation);
		}
	}, [queryClient, getConversationQuery.data, conversations, recipient, getConversationUrl]);

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
							from: customerPhoneNumber!.phoneNumber,
							customerId: customer!.id,
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
		},
	);

	return {
		conversation: getConversationQuery.data,
		error: getConversationQuery.error,
		refetch: getConversationQuery.refetch,
		sendMessage,
	};
}
