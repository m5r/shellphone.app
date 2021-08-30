import { Fragment, useRef } from "react";
import type { BlitzPage } from "blitz";
import { Link, Routes, useRouter } from "blitz";
import { atom, useAtom } from "jotai";
import { usePress } from "@react-aria/interactions";
import { Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackspace, faPhoneAlt as faPhone } from "@fortawesome/pro-solid-svg-icons";

import { Direction } from "db";
import Layout from "../../core/layouts/layout";
import Keypad from "../components/keypad";
import useRequireOnboarding from "../../core/hooks/use-require-onboarding";
import usePhoneCalls from "../hooks/use-phone-calls";

const KeypadPage: BlitzPage = () => {
	useRequireOnboarding();
	const router = useRouter();
	const [phoneCalls] = usePhoneCalls();
	const [phoneNumber, setPhoneNumber] = useAtom(phoneNumberAtom);
	const removeDigit = useAtom(pressBackspaceAtom)[1];
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const pressDigit = useAtom(pressDigitAtom)[1];
	const longPressDigit = useAtom(longPressDigitAtom)[1];
	const onZeroPressProps = {
		onPressStart() {
			console.log("0");
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

	return (
		<div className="w-96 h-full flex flex-col justify-around py-5 mx-auto text-center text-black bg-white">
			<div className="h-16 text-3xl text-gray-700">
				<span>{phoneNumber}</span>
			</div>

			<Keypad onDigitPressProps={onDigitPressProps} onZeroPressProps={onZeroPressProps}>
				<button
					onClick={async () => {
						if (phoneNumber === "") {
							const lastCall = phoneCalls[0];
							if (lastCall) {
								const lastCallRecipient =
									lastCall.direction === Direction.Inbound ? lastCall.from : lastCall.to;
								setPhoneNumber(lastCallRecipient);
							}

							return;
						}

						await router.push(Routes.OutgoingCall({ recipient: encodeURI(phoneNumber) }));
						setPhoneNumber("");
					}}
					className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-green-800 rounded-full"
				>
					<FontAwesomeIcon className="w-6 h-6" icon={faPhone} color="white" size="lg" />
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
						<FontAwesomeIcon className="w-6 h-6" icon={faBackspace} size="lg" />
					</div>
				</Transition>
			</Keypad>
		</div>
	);
};

const phoneNumberAtom = atom("");
const pressDigitAtom = atom(null, (get, set, digit: string) => {
	if (get(phoneNumberAtom).length > 17) {
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

KeypadPage.getLayout = (page) => <Layout title="Keypad">{page}</Layout>;

KeypadPage.authenticate = { redirectTo: Routes.SignIn() };

export default KeypadPage;
