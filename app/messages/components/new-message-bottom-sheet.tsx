import { Suspense, useEffect, useRef, useState } from "react";
import { BottomSheet } from "react-spring-bottom-sheet";
import { useAtom } from "jotai";
import { useRouter, Routes } from "blitz";

import "react-spring-bottom-sheet/dist/style.css";

import NewMessageArea from "./new-message-area";
import { bottomSheetOpenAtom } from "../pages/messages";

export default function NewMessageBottomSheet() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useAtom(bottomSheetOpenAtom);
	const [recipient, setRecipient] = useState("");
	const recipientRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		recipientRef.current?.focus();
	});

	return (
		<BottomSheet
			open={isOpen}
			onDismiss={() => setIsOpen(false)}
			snapPoints={({ maxHeight }) => maxHeight / 2}
			header={
				<div className="w-full flex items-center justify-center p-4 text-black relative">
					<span className="font-semibold text-base">New Message</span>

					<button onClick={() => setIsOpen(false)} className="absolute right-4">
						Cancel
					</button>
				</div>
			}
		>
			<main className="flex flex-col h-full overflow-hidden">
				<div className="flex items-center p-4 border-t border-b">
					<span className="mr-4 text-[#333]">To:</span>
					<input
						ref={recipientRef}
						onChange={(event) => setRecipient(event.target.value)}
						className="bg-none border-none outline-none flex-1 text-black"
					/>
				</div>
				<Suspense fallback={null}>
					<NewMessageArea
						recipient={recipient}
						onSend={() => {
							router.push(Routes.ConversationPage({ recipient })).then(() => setIsOpen(false));
						}}
					/>
				</Suspense>
			</main>
		</BottomSheet>
	);
}
