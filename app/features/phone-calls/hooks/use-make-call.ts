import { useCallback, useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { Call } from "@twilio/voice-sdk";

import useDevice from "./use-device";

type Params = {
	recipient: string;
	onHangUp?: () => void;
};

export default function useMakeCall({ recipient, onHangUp }: Params) {
	const navigate = useNavigate();
	const [outgoingConnection, setOutgoingConnection] = useState<Call | null>(null);
	const [state, setState] = useState<State>("initial");
	const { device, isDeviceReady } = useDevice();

	const endCall = useCallback(
		function endCall() {
			outgoingConnection?.off("cancel", endCall);
			outgoingConnection?.off("disconnect", endCall);
			outgoingConnection?.disconnect();

			setState("call_ending");
			setTimeout(() => {
				setState("call_ended");
				setTimeout(() => navigate("/keypad"), 100);
			}, 150);
		},
		[outgoingConnection, navigate],
	);

	const makeCall = useCallback(
		async function makeCall() {
			console.log({ device, isDeviceReady });
			if (!device || !isDeviceReady) {
				console.warn("device is not ready yet, can't make the call");
				return;
			}

			if (state !== "initial") {
				return;
			}

			if (device.isBusy) {
				console.error("device is busy, this shouldn't happen");
				return;
			}

			setState("calling");

			const params = { To: recipient };
			const outgoingConnection = await device.connect({ params });
			setOutgoingConnection(outgoingConnection);

			outgoingConnection.on("error", (error) => {
				outgoingConnection.off("cancel", endCall);
				outgoingConnection.off("disconnect", endCall);
				setState(() => {
					// hack to trigger the error boundary
					throw error;
				});
			});
			outgoingConnection.once("accept", (call: Call) => setState("call_in_progress"));
			outgoingConnection.on("cancel", endCall);
			outgoingConnection.on("disconnect", endCall);
		},
		[device, isDeviceReady, recipient, state],
	);

	const sendDigits = useCallback(
		function sendDigits(digits: string) {
			return outgoingConnection?.sendDigits(digits);
		},
		[outgoingConnection],
	);

	const hangUp = useCallback(
		function hangUp() {
			setState("call_ending");
			outgoingConnection?.disconnect();
			device?.disconnectAll();
			device?.destroy();
			onHangUp?.();
			navigate("/keypad");
			// TODO: outgoingConnection.off is not a function
			outgoingConnection?.off("cancel", endCall);
			outgoingConnection?.off("disconnect", endCall);
		},
		[device, endCall, onHangUp, outgoingConnection, navigate],
	);

	return {
		makeCall,
		sendDigits,
		hangUp,
		state,
	};
}

type State = "initial" | "ready" | "calling" | "call_in_progress" | "call_ending" | "call_ended";
