import { Suspense, useRef, useState } from "react";
import BottomSheet from "react-modal-sheet";
import { useAtom } from "jotai";

import NewMessageArea from "./new-message-area";
import { bottomSheetOpenAtom } from "~/routes/__app/messages";

export default function NewMessageBottomSheet() {
	const [isOpen, setIsOpen] = useAtom(bottomSheetOpenAtom);
	const [recipient, setRecipient] = useState("");
	const recipientRef = useRef<HTMLInputElement>(null);

	return (
		<BottomSheet
			isOpen={isOpen}
			onOpenEnd={() => {
				// doesn't work with iOS safari *sigh*
				recipientRef.current?.focus();
			}}
			onClose={() => setIsOpen(false)}
			snapPoints={[0.5]}
		>
			<BottomSheet.Container>
				<BottomSheet.Header>
					<div className="w-full flex items-center justify-center p-4 text-black relative">
						<span className="font-semibold text-base">New Message</span>

						<button onClick={() => setIsOpen(false)} className="absolute right-4">
							Cancel
						</button>
					</div>
				</BottomSheet.Header>
				<BottomSheet.Content>
					<main className="flex flex-col h-full overflow-hidden">
						<div className="flex items-center p-4 border-t border-b">
							<span className="mr-4 text-[#333]">To:</span>
							<input
								ref={recipientRef}
								onChange={(event) => setRecipient(event.target.value)}
								className="bg-none border-none outline-none flex-1 text-black"
								type="tel"
							/>
						</div>
						<Suspense fallback={null}>
							<NewMessageArea onSend={() => setIsOpen(false)} recipient={recipient} />
						</Suspense>
					</main>
				</BottomSheet.Content>
			</BottomSheet.Container>

			<BottomSheet.Backdrop onTap={() => setIsOpen(false)} />
		</BottomSheet>
	);
}
