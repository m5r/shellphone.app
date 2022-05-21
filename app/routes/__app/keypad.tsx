import { Fragment, useRef, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { atom, useAtom } from "jotai";
import { usePress } from "@react-aria/interactions";
import { Transition } from "@headlessui/react";
import { IoBackspace, IoCall } from "react-icons/io5";
import { Direction } from "@prisma/client";

import Keypad from "~/features/keypad/components/keypad";
// import usePhoneCalls from "~/features/keypad/hooks/use-phone-calls";
import useKeyPress from "~/features/keypad/hooks/use-key-press";
// import useCurrentUser from "~/features/core/hooks/use-current-user";
import KeypadErrorModal from "~/features/keypad/components/keypad-error-modal";
import InactiveSubscription from "~/features/core/components/inactive-subscription";

export default function KeypadPage() {
	const { hasFilledTwilioCredentials, hasPhoneNumber, hasOngoingSubscription } = {
		hasFilledTwilioCredentials: false,
		hasPhoneNumber: false,
		hasOngoingSubscription: false,
	};
	const navigate = useNavigate();
	const [isKeypadErrorModalOpen, setIsKeypadErrorModalOpen] = useState(false);
	const phoneCalls: any[] = []; //usePhoneCalls();
	const [phoneNumber, setPhoneNumber] = useAtom(phoneNumberAtom);
	const removeDigit = useAtom(pressBackspaceAtom)[1];
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const pressDigit = useAtom(pressDigitAtom)[1];
	useKeyPress((key) => {
		if (!hasOngoingSubscription) {
			return;
		}

		if (key === "Backspace") {
			return removeDigit();
		}

		pressDigit(key);
	});
	const longPressDigit = useAtom(longPressDigitAtom)[1];
	const onZeroPressProps = {
		onPressStart() {
			if (!hasOngoingSubscription) {
				return;
			}

			pressDigit("0");
			timeoutRef.current = setTimeout(() => {
				longPressDigit("+");
			}, 750);
		},
		onPressEnd() {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		},
	};
	const onDigitPressProps = (digit: string) => ({
		onPress() {
			// navigator.vibrate(1); // removed in webkit
			if (!hasOngoingSubscription) {
				return;
			}

			pressDigit(digit);
		},
	});
	const { pressProps: onBackspacePress } = usePress({
		onPressStart() {
			timeoutRef.current = setTimeout(() => {
				removeDigit();
				intervalRef.current = setInterval(removeDigit, 75);
			}, 325);
		},
		onPressEnd() {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}

			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
				return;
			}

			removeDigit();
		},
	});

	if (!hasOngoingSubscription) {
		return (
			<>
				<InactiveSubscription />
				<div className="filter blur-sm select-none absolute top-0 w-full h-full z-0">
					<section className="relative w-96 h-full flex flex-col justify-around mx-auto py-5 text-center">
						<div className="h-16 text-3xl text-gray-700">
							<span>{phoneNumber}</span>
						</div>
						<Keypad onDigitPressProps={onDigitPressProps} onZeroPressProps={onZeroPressProps}>
							<button className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-green-800 rounded-full">
								<IoCall className="w-6 h-6 text-white" />
							</button>
						</Keypad>
					</section>
				</div>
			</>
		);
	}

	return (
		<>
			<div className="w-96 h-full flex flex-col justify-around py-5 mx-auto text-center text-black">
				<div className="h-16 text-3xl text-gray-700">
					<span>{phoneNumber}</span>
				</div>

				<Keypad onDigitPressProps={onDigitPressProps} onZeroPressProps={onZeroPressProps}>
					<button
						onClick={async () => {
							if (!hasFilledTwilioCredentials || !hasPhoneNumber) {
								setIsKeypadErrorModalOpen(true);
								return;
							}

							if (!hasOngoingSubscription) {
								return;
							}

							if (phoneNumber === "") {
								const lastCall = phoneCalls?.[0];
								if (lastCall) {
									const lastCallRecipient =
										lastCall.direction === Direction.Inbound ? lastCall.from : lastCall.to;
									setPhoneNumber(lastCallRecipient);
								}

								return;
							}

							await navigate(`/outgoing-call/${encodeURI(phoneNumber)}`);
							setPhoneNumber("");
						}}
						className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-green-800 rounded-full"
					>
						<IoCall className="w-6 h-6 text-white" />
					</button>

					<Transition
						as={Fragment}
						show={phoneNumber.length > 0}
						enter="transition duration-300 ease-in-out"
						enterFrom="transform scale-95 opacity-0"
						enterTo="transform scale-100 opacity-100"
						leave="transition duration-100 ease-out"
						leaveFrom="transform scale-100 opacity-100"
						leaveTo="transform scale-95 opacity-0"
					>
						<div {...onBackspacePress} className="cursor-pointer select-none m-auto">
							<IoBackspace className="w-6 h-6" />
						</div>
					</Transition>
				</Keypad>
			</div>
			<KeypadErrorModal closeModal={() => setIsKeypadErrorModalOpen(false)} isOpen={isKeypadErrorModalOpen} />
		</>
	);
}

const phoneNumberAtom = atom("");
const pressDigitAtom = atom(null, (get, set, digit: string) => {
	if (get(phoneNumberAtom).length > 17) {
		return;
	}

	if ("0123456789+#*".indexOf(digit) === -1) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState + digit);
});
const longPressDigitAtom = atom(null, (get, set, replaceWith: string) => {
	if (get(phoneNumberAtom).length > 17) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState.slice(0, -1) + replaceWith);
});
const pressBackspaceAtom = atom(null, (get, set) => {
	if (get(phoneNumberAtom).length === 0) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState.slice(0, -1));
});
