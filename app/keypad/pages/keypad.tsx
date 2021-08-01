import type { BlitzPage } from "blitz";
import { Routes } from "blitz";
import type { FunctionComponent } from "react";
import { atom, useAtom } from "jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackspace, faPhoneAlt as faPhone } from "@fortawesome/pro-solid-svg-icons";

import Layout from "../../core/layouts/layout";
import useRequireOnboarding from "../../core/hooks/use-require-onboarding";

const Keypad: BlitzPage = () => {
	useRequireOnboarding();
	const phoneNumber = useAtom(phoneNumberAtom)[0];
	const pressBackspace = useAtom(pressBackspaceAtom)[1];

	return (
		<div className="w-96 h-full flex flex-col justify-around py-5 mx-auto text-center text-black bg-white">
			<div className="h-16 text-3xl text-gray-700">
				<span>{phoneNumber}</span>
			</div>

			<section>
				<Row>
					<Digit digit="1" />
					<Digit digit="2">
						<DigitLetters>ABC</DigitLetters>
					</Digit>
					<Digit digit="3">
						<DigitLetters>DEF</DigitLetters>
					</Digit>
				</Row>
				<Row>
					<Digit digit="4">
						<DigitLetters>GHI</DigitLetters>
					</Digit>
					<Digit digit="5">
						<DigitLetters>JKL</DigitLetters>
					</Digit>
					<Digit digit="6">
						<DigitLetters>MNO</DigitLetters>
					</Digit>
				</Row>
				<Row>
					<Digit digit="7">
						<DigitLetters>PQRS</DigitLetters>
					</Digit>
					<Digit digit="8">
						<DigitLetters>TUV</DigitLetters>
					</Digit>
					<Digit digit="9">
						<DigitLetters>WXYZ</DigitLetters>
					</Digit>
				</Row>
				<Row>
					<Digit digit="*" />
					<ZeroDigit />
					<Digit digit="#" />
				</Row>
				<Row>
					<div className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-green-800 rounded-full">
						<FontAwesomeIcon icon={faPhone} color="white" size="lg" />
					</div>
					<div className="cursor-pointer select-none my-auto" onClick={pressBackspace}>
						<FontAwesomeIcon icon={faBackspace} size="lg" />
					</div>
				</Row>
			</section>
		</div>
	);
};

const ZeroDigit: FunctionComponent = () => {
	// TODO: long press, convert + to 0
	const pressDigit = useAtom(pressDigitAtom)[1];
	const onClick = () => pressDigit("0");

	return (
		<div onClick={onClick} className="text-3xl cursor-pointer select-none">
			0 <DigitLetters>+</DigitLetters>
		</div>
	);
};

const Row: FunctionComponent = ({ children }) => (
	<div className="grid grid-cols-3 p-4 my-0 mx-auto text-black">{children}</div>
);

const Digit: FunctionComponent<{ digit: string }> = ({ children, digit }) => {
	const pressDigit = useAtom(pressDigitAtom)[1];
	const onClick = () => pressDigit(digit);

	return (
		<div onClick={onClick} className="text-3xl cursor-pointer select-none">
			{digit}
			{children}
		</div>
	);
};

const DigitLetters: FunctionComponent = ({ children }) => (
	<div className="text-xs text-gray-600">{children}</div>
);

const phoneNumberAtom = atom("");
const pressDigitAtom = atom(null, (get, set, digit) => {
	if (get(phoneNumberAtom).length > 17) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState + digit);
});
const pressBackspaceAtom = atom(null, (get, set) => {
	if (get(phoneNumberAtom).length === 0) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState.slice(0, -1));
});

Keypad.getLayout = (page) => <Layout title="Keypad">{page}</Layout>;

Keypad.authenticate = { redirectTo: Routes.SignIn() };

export default Keypad;
