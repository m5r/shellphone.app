import { useCallback, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { IoCall } from "react-icons/io5";

import { getSeoMeta } from "~/utils/seo";
import { usePhoneNumber, usePressDigit } from "~/features/keypad/hooks/atoms";
import useDevice from "~/features/phone-calls/hooks/use-device";
import useReceiveCall from "~/features/phone-calls/hooks/use-receive-call";
import Keypad from "~/features/keypad/components/keypad";

export const meta: MetaFunction = ({ params }) => {
	const recipient = decodeURIComponent(params.recipient ?? "");

	return {
		...getSeoMeta({
			title: `Calling ${recipient}`,
		}),
	};
};

export default function IncomingCallPage() {
	const params = useParams<{ recipient: string }>();
	const recipient = decodeURIComponent(params.recipient ?? "");
	const [phoneNumber, setPhoneNumber] = usePhoneNumber();
	const onHangUp = useCallback(() => setPhoneNumber(""), [setPhoneNumber]);
	const call = useReceiveCall({ onHangUp });
	const { isDeviceReady } = useDevice();
	const pressDigit = usePressDigit();
	const onDigitPressProps = useCallback(
		(digit: string) => ({
			onPress() {
				pressDigit(digit);

				call.sendDigits(digit);
			},
		}),
		[call, pressDigit],
	);

	useEffect(() => {
		if (isDeviceReady) {
			call.acceptCall();
		}
	}, [call, isDeviceReady]);

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
				<button
					onClick={call.hangUp}
					className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-red-800 rounded-full"
				>
					<IoCall className="w-6 h-6 text-white" />
				</button>
			</Keypad>
		</div>
	);

	function translateState(state: typeof call.state) {
		switch (state) {
			case "initial":
			case "ready":
				return "Connecting...";
			case "calling":
				return "Calling...";
			case "call_in_progress":
				return "In call"; // TODO display time elapsed
			case "call_ending":
				return "Call ending...";
			case "call_ended":
				return "Call ended";
		}
	}
}

export const handle = { hideFooter: true };
