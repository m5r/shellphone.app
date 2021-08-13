import type { BlitzPage } from "blitz";
import { Routes, useRouter } from "blitz";
import { useEffect, useMemo } from "react";
import { atom, useAtom } from "jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt as faPhone } from "@fortawesome/pro-solid-svg-icons";

import useRequireOnboarding from "../../../core/hooks/use-require-onboarding";
import Keypad from "../../components/keypad";
import useMakeCall from "../../hooks/use-make-call";

const OutgoingCall: BlitzPage = () => {
	const router = useRouter();
	const recipient = decodeURIComponent(router.params.recipient);
	const call = useMakeCall(recipient);

	useEffect(() => {
		console.log("call.state", call.state);
		if (call.state === "ready") {
			call.makeCall();
		}
	}, [call.state]);

	useRequireOnboarding();
	const phoneNumber = useAtom(phoneNumberAtom)[0];
	const pressDigit = useAtom(pressDigitAtom)[1];
	const onDigitPressProps = useMemo(
		() => (digit: string) => ({
			onPress() {
				pressDigit(digit);

				call.sendDigits(digit);
			},
		}),
		[call, pressDigit],
	);
	const hangUp = useMemo(
		() => () => {
			call.hangUp();

			// return router.replace(Routes.KeypadPage());
			return router.push(Routes.KeypadPage());
		},
		[call, router],
	);

	return (
		<div className="w-96 h-full flex flex-col justify-around py-5 mx-auto text-center text-black bg-white">
			<div className="h-16 text-3xl text-gray-700">
				<span>{recipient}</span>
			</div>

			<div className="mb-4 text-gray-600">
				<div className="h-8 text-2xl">{phoneNumber}</div>
				<div className="h-8 text-lg">{translateState(call.state)}</div>
			</div>

			<Keypad onDigitPressProps={onDigitPressProps} onZeroPressProps={onDigitPressProps("0")}>
				<div
					onClick={hangUp}
					className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-red-800 rounded-full"
				>
					<FontAwesomeIcon className="w-6 h-6" icon={faPhone} color="white" size="lg" />
				</div>
			</Keypad>
		</div>
	);

	function translateState(state: typeof call.state): string {
		switch (state) {
			case "initial":
			case "ready":
				return "Connecting...";
			case "calling":
				return "Calling...";
			case "call_in_progress":
				return ""; // TODO display time elapsed
			case "call_ending":
				return "Call ending...";
			case "call_ended":
				return "Call ended";
		}
	}
};

const phoneNumberAtom = atom("");
const pressDigitAtom = atom(null, (get, set, digit: string) => {
	if (get(phoneNumberAtom).length > 17) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState + digit);
});

OutgoingCall.authenticate = { redirectTo: Routes.SignIn() };

export default OutgoingCall;
