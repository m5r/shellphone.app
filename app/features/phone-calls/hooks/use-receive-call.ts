import { useCallback, useState } from "react";
import { useNavigate } from "@remix-run/react";

import useDevice from "./use-device";
import useCall from "./use-call";

type Params = {
	onHangUp?: () => void;
};

export default function useMakeCall({ onHangUp }: Params) {
	const navigate = useNavigate();
	const [call] = useCall();
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

	const acceptCall = useCallback(
		async function acceptCall() {
			if (!device || !isDeviceReady) {
				console.warn("device is not ready yet, can't make the call");
				return;
			}

			if (state !== "initial") {
				return;
			}

			if (device.isBusy || !call) {
				console.error("device is busy, this shouldn't happen");
				return;
			}

			call.accept();
			setState("call_in_progress");

			call.once("cancel", endCall);
			call.once("disconnect", endCall);
		},
		[call, device, endCall, isDeviceReady, state],
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
		acceptCall,
		sendDigits,
		hangUp,
		state,
	};
}

type State = "initial" | "ready" | "calling" | "call_in_progress" | "call_ending" | "call_ended";
