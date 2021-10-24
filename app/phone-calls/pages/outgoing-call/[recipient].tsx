import { useCallback, useEffect } from "react";
import type { WithRouterProps } from "next/dist/client/with-router";
import type { BlitzPage, ErrorFallbackProps } from "blitz";
import { ErrorBoundary, Routes, useParam, withRouter } from "blitz";
import type { TwilioError } from "@twilio/voice-sdk";
import { atom, useAtom } from "jotai";
import { IoCall } from "react-icons/io5";

import useMakeCall from "../../hooks/use-make-call";
import useDevice from "../../hooks/use-device";

import Keypad from "../../components/keypad";

const OutgoingCall: BlitzPage = () => {
	const [phoneNumber, setPhoneNumber] = useAtom(phoneNumberAtom);
	const recipient = decodeURIComponent(useParam("recipient", "string") ?? "");
	const onHangUp = useCallback(() => setPhoneNumber(""), [setPhoneNumber]);
	const call = useMakeCall({ recipient, onHangUp });
	const { isDeviceReady } = useDevice();
	const pressDigit = useAtom(pressDigitAtom)[1];
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
			call.makeCall();
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

	function translateState(state: typeof call.state): string {
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
};

const phoneNumberAtom = atom("");
const pressDigitAtom = atom(null, (get, set, digit: string) => {
	if (get(phoneNumberAtom).length > 17) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState + digit);
});

OutgoingCall.authenticate = { redirectTo: Routes.SignIn() };
OutgoingCall.getLayout = (page) => <ErrorBoundary FallbackComponent={ErrorFallback}>{page}</ErrorBoundary>;

const ErrorFallback = withRouter(function WrappedErrorFallback({
	error,
	router,
}: ErrorFallbackProps & WithRouterProps) {
	console.log("error", JSON.parse(JSON.stringify(error)));
	return (
		<div className="w-screen h-screen flex">
			<div className="max-w-md m-auto p-4">
				<h2 className="text-lg py-3 leading-relaxed font-medium text-gray-900">
					Sorry, an error has occurred during your call
				</h2>
				{isTwilioError(error) ? (
					<pre className="break-normal whitespace-normal mt-2 text-sm rounded py-3 px-5 bg-[#111] text-gray-300">
						<div>
							{error.description} ({error.code})
						</div>
						<div>{error.explanation}</div>
					</pre>
				) : null}
				<p className="mt-2 text-sm text-gray-500">
					We have been automatically notified and we&#39;re doing our best to make sure this does not happen
					again!
				</p>

				<div className="mt-5 md:mt-4 md:flex md:flex-row-reverse">
					<button
						type="button"
						className="transition-colors duration-150 mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 md:mt-0 md:w-auto md:text-sm"
						onClick={() => router.replace(Routes.KeypadPage())}
					>
						Take me back to the app
					</button>
				</div>
			</div>
		</div>
	);
});

function isTwilioError(error: any): error is typeof TwilioError {
	return error.hasOwnProperty("explanation");
}

export default OutgoingCall;
