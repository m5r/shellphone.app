import { useEffect, useRef } from "react";
import { Form, useTransition } from "@remix-run/react";
import { IoSend } from "react-icons/io5";

function NewMessageArea() {
	const transition = useTransition();
	const formRef = useRef<HTMLFormElement>(null);
	const textFieldRef = useRef<HTMLTextAreaElement>(null);
	const isSendingMessage = transition.state === "submitting";

	useEffect(() => {
		if (isSendingMessage) {
			formRef.current?.reset();
			textFieldRef.current?.focus();
		}
	}, [isSendingMessage]);

	return (
		<Form
			ref={formRef}
			method="post"
			className="absolute bottom-0 w-screen backdrop-filter backdrop-blur-xl bg-white bg-opacity-75 border-t flex flex-row p-2 pr-0"
			replace
		>
			<textarea
				ref={textFieldRef}
				name="content"
				className="resize-none rounded-full flex-1"
				style={{
					scrollbarWidth: "none",
				}}
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
		</Form>
	);
}

export default NewMessageArea;
