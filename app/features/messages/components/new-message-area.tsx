import type { FunctionComponent } from "react";
import { IoSend } from "react-icons/io5";
import { type Message, Direction, MessageStatus } from "@prisma/client";
import useSession from "~/features/core/hooks/use-session";

type Props = {
	recipient: string;
	onSend?: () => void;
};

const NewMessageArea: FunctionComponent<Props> = ({ recipient, onSend }) => {
	const { currentOrganization, /*hasOngoingSubscription*/ } = useSession();
	// const phoneNumber = useCurrentPhoneNumber();
	// const sendMessageMutation = useMutation(sendMessage)[0];
	const onSubmit = async () => {
		/*const id = uuidv4();
		const message: Message = {
			id,
			organizationId: organization!.id,
			phoneNumberId: phoneNumber!.id,
			from: phoneNumber!.number,
			to: recipient,
			content: hasOngoingSubscription
				? content
				: content + "\n\nSent from Shellphone (https://www.shellphone.app)",
			direction: Direction.Outbound,
			status: MessageStatus.Queued,
			sentAt: new Date(),
		};*/

		/*await setConversationsQueryData(
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
		);*/
		// setValue("content", "");
		// onSend?.();
	};

	return (
		<form
			onSubmit={onSubmit}
			className="absolute bottom-0 w-screen backdrop-filter backdrop-blur-xl bg-white bg-opacity-75 border-t flex flex-row h-16 p-2 pr-0"
		>
			<textarea
				name="content"
				className="resize-none flex-1"
				autoCapitalize="sentences"
				autoCorrect="on"
				placeholder="Text message"
				rows={1}
				spellCheck
				required
			/>
			<button type="submit">
				<IoSend className="h-8 w-8 pl-1 pr-2" />
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
