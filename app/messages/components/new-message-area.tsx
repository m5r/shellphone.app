import type { FunctionComponent } from "react";
import { useMutation, useQuery } from "blitz";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/pro-regular-svg-icons";
import { useForm } from "react-hook-form";

import sendMessage from "../mutations/send-message";
import { Direction, Message, MessageStatus } from "../../../db";
import getConversationsQuery from "../queries/get-conversations";
import useCurrentUser from "../../core/hooks/use-current-user";
import useCurrentPhoneNumber from "../../core/hooks/use-current-phone-number";

type Form = {
	content: string;
};

type Props = {
	recipient: string;
	onSend?: () => void;
};

const NewMessageArea: FunctionComponent<Props> = ({ recipient, onSend }) => {
	const { organization } = useCurrentUser();
	const phoneNumber = useCurrentPhoneNumber();
	const sendMessageMutation = useMutation(sendMessage)[0];
	const { setQueryData: setConversationsQueryData, refetch: refetchConversations } = useQuery(
		getConversationsQuery,
		{},
	)[1];
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitting },
	} = useForm<Form>();
	const onSubmit = handleSubmit(async ({ content }) => {
		if (!recipient) {
			return;
		}

		if (isSubmitting) {
			return;
		}

		const id = uuidv4();
		const message: Message = {
			id,
			organizationId: organization!.id,
			phoneNumberId: phoneNumber!.id,
			from: phoneNumber!.number,
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
					nextConversations[recipient] = {
						recipient,
						formattedPhoneNumber: recipient,
						messages: [],
					};
				}

				nextConversations[recipient]!.messages = [...nextConversations[recipient]!.messages, message];

				return Object.fromEntries(
					Object.entries(nextConversations).sort(
						([, a], [, b]) =>
							b.messages[b.messages.length - 1]!.sentAt.getTime() -
							a.messages[a.messages.length - 1]!.sentAt.getTime(),
					),
				);
			},
			{ refetch: false },
		);
		setValue("content", "");
		onSend?.();
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
};

export default NewMessageArea;

function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
