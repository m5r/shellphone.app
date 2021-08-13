import type { BlitzPage } from "blitz";
import { Link, Routes, useRouter } from "blitz";
import { useRef } from "react";
import { atom, useAtom } from "jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackspace, faPhoneAlt as faPhone } from "@fortawesome/pro-solid-svg-icons";

import Layout from "../../core/layouts/layout";
import Keypad from "../components/keypad";
import useRequireOnboarding from "../../core/hooks/use-require-onboarding";

const KeypadPage: BlitzPage = () => {
	useRequireOnboarding();
	const router = useRouter();
	const [phoneNumber, setPhoneNumber] = useAtom(phoneNumberAtom);
	const pressBackspace = useAtom(pressBackspaceAtom)[1];
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pressDigit = useAtom(pressDigitAtom)[1];
	const longPressDigit = useAtom(longPressDigitAtom)[1];
	const onZeroPressProps = {
		onPressStart() {
			pressDigit("0");
			timeoutRef.current = setTimeout(() => {
				longPressDigit("+");
			}, 750);
		},
		onPressEnd() {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		},
	};
	const onDigitPressProps = (digit: string) => ({
		onPress() {
			// navigator.vibrate(1); // removed in webkit
			pressDigit(digit);
		},
	});

	return (
		<div className="w-96 h-full flex flex-col justify-around py-5 mx-auto text-center text-black bg-white">
			<div className="h-16 text-3xl text-gray-700">
				<span>{phoneNumber}</span>
			</div>

			<Keypad onDigitPressProps={onDigitPressProps} onZeroPressProps={onZeroPressProps}>
				<Link href={Routes.OutgoingCall({ recipient: encodeURI(phoneNumber) })}>
					<button
						onClick={async () => {
							if (phoneNumber === "") {
								// TODO setPhoneNumber(lastCallRecipient);
							}

							await router.push(Routes.OutgoingCall({ recipient: encodeURI(phoneNumber) }));
							setPhoneNumber("");
						}}
						className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-green-800 rounded-full"
					>
						<FontAwesomeIcon className="w-6 h-6" icon={faPhone} color="white" size="lg" />
					</button>
				</Link>
				<div className="cursor-pointer select-none m-auto" onClick={pressBackspace}>
					<FontAwesomeIcon className="w-6 h-6" icon={faBackspace} size="lg" />
				</div>
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
