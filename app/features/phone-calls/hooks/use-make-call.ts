import { useCallback, useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { Call } from "@twilio/voice-sdk";

import useDevice from "./use-device";
import useCall from "./use-call";

type Params = {
	recipient: string;
	onHangUp?: () => void;
};

export default function useMakeCall({ recipient, onHangUp }: Params) {
	const navigate = useNavigate();
	const [call, setCall] = useCall();
	const [state, setState] = useState<State>("initial");
	const { device, isDeviceReady } = useDevice();

	const endCall = useCallback(
		function endCall() {
			setState("call_ending");
			setTimeout(() => {
				setState("call_ended");
				setTimeout(() => navigate("/keypad"), 100);
			}, 150);
		},
		[navigate],
	);

	const makeCall = useCallback(
		async function makeCall() {
			if (!device || !isDeviceReady) {
				console.warn("device is not ready yet, can't make the call");
				return;
			}

			if (state !== "initial") {
				return;
			}

			if (device.isBusy || Boolean(call)) {
				console.error("device is busy, this shouldn't happen");
				return;
			}

			setState("calling");

			const params = { To: recipient };
			const outgoingConnection = await device.connect({ params });
			setCall(outgoingConnection);

			outgoingConnection.once("accept", (call: Call) => setState("call_in_progress"));
			outgoingConnection.once("cancel", endCall);
			outgoingConnection.once("disconnect", endCall);
		},
		[call, device, endCall, isDeviceReady, recipient, setCall, state],
	);

	const sendDigits = useCallback(
		function sendDigits(digits: string) {
			return call?.sendDigits(digits);
		},
		[call],
	);

	const hangUp = useCallback(
		function hangUp() {
			setState("call_ending");
			call?.disconnect();
			onHangUp?.();
			navigate("/keypad");
		},
		[call, onHangUp, navigate],
	);

	return {
		makeCall,
		sendDigits,
		hangUp,
		state,
	};
}

type State = "initial" | "ready" | "calling" | "call_in_progress" | "call_ending" | "call_ended";
