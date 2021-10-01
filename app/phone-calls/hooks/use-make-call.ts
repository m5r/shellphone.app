import { useCallback, useState } from "react";
import { useRouter, Routes } from "blitz";
import { Call } from "@twilio/voice-sdk";

import useDevice from "./use-device";

import appLogger from "../../../integrations/logger";

const logger = appLogger.child({ module: "use-make-call" });

type Params = {
	recipient: string;
	onHangUp?: () => void;
};

export default function useMakeCall({ recipient, onHangUp }: Params) {
	const [outgoingConnection, setOutgoingConnection] = useState<Call | null>(null);
	const [state, setState] = useState<State>("initial");
	const { device, isDeviceReady } = useDevice();
	const router = useRouter();

	const endCall = useCallback(
		function endCall() {
			outgoingConnection?.off("cancel", endCall);
			outgoingConnection?.off("disconnect", endCall);
			outgoingConnection?.disconnect();

			setState("call_ending");
			setTimeout(() => {
				setState("call_ended");
				setTimeout(() => router.replace(Routes.KeypadPage()), 100);
			}, 150);
		},
		[outgoingConnection, router],
	);

	const makeCall = useCallback(
		async function makeCall() {
			if (!device || !isDeviceReady) {
				logger.warn("device is not ready yet, can't make the call");
				return;
			}

			if (state !== "initial") {
				return;
			}

			if (device.isBusy) {
				logger.error("device is busy, this shouldn't happen");
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
			router.replace(Routes.KeypadPage());
			// TODO: outgoingConnection.off is not a function
			outgoingConnection?.off("cancel", endCall);
			outgoingConnection?.off("disconnect", endCall);
		},
		[device, endCall, onHangUp, outgoingConnection, router],
	);

	return {
		makeCall,
		sendDigits,
		hangUp,
		state,
	};
}

type State = "initial" | "ready" | "calling" | "call_in_progress" | "call_ending" | "call_ended";
