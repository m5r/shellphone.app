import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/pro-regular-svg-icons";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useRouter } from "blitz";

import sendMessage from "../mutations/send-message";
import { Direction, Message, MessageStatus } from "../../../db";
import getConversationsQuery from "../queries/get-conversations";
import useCurrentCustomer from "../../core/hooks/use-current-customer";
import useCustomerPhoneNumber from "../../core/hooks/use-customer-phone-number";

type Form = {
	content: string;
};

export default function NewMessageArea() {
	const router = useRouter();
	const recipient = router.params.recipient;
	const { customer } = useCurrentCustomer();
	const phoneNumber = useCustomerPhoneNumber();
	const sendMessageMutation = useMutation(sendMessage)[0];
	const { setQueryData: setConversationsQueryData, refetch: refetchConversations } = useQuery(
		getConversationsQuery,
		{}
	)[1];
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<Form>();
	const onSubmit = handleSubmit(async ({ content }) => {
		if (isSubmitting) {
			return;
		}

		const id = uuidv4();
		const message: Message = {
			id,
			customerId: customer!.id,
			twilioSid: id,
			from: phoneNumber!.phoneNumber,
			to: recipient,
			content: content,
			direction: Direction.Outbound,
			status: MessageStatus.Queued,
			sentAt: new Date(),
		};

		await setConversationsQueryData(
			(conversations) => {
				const nextConversations = { ...conversations };
				if (!nextConversations[recipient]) {
					nextConversations[recipient] = [];
				}

				nextConversations[recipient] = [...nextConversations[recipient]!, message];
				return nextConversations;
			},
			{ refetch: false }
		);
		setValue("content", "");
		await sendMessageMutation({ to: recipient, content });
		await refetchConversations({ cancelRefetch: true });
	});

	return (
		<form
			onSubmit={onSubmit}
			className="absolute bottom-0 w-screen backdrop-filter backdrop-blur-xl bg-white bg-opacity-75 border-t flex flex-row h-16 p-2 pr-0"
		>
			<textarea
				className="resize-none flex-1"
				autoCapitalize="sentences"
				autoCorrect="on"
				placeholder="Text message"
				rows={1}
				spellCheck
				{...register("content", { required: true })}
			/>
			<button type="submit">
				<FontAwesomeIcon size="2x" className="h-8 w-8 pl-1 pr-2" icon={faPaperPlane} />
			</button>
		</form>
	);
}

function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
