import { useState } from "react";
import { useRouter, Routes } from "blitz";
import { Call } from "@twilio/voice-sdk";

import useDevice from "./use-device";

type Params = {
	recipient: string;
	onHangUp?: () => void;
};

export default function useMakeCall({ recipient, onHangUp }: Params) {
	const [outgoingConnection, setOutgoingConnection] = useState<Call | null>(null);
	const [state, setState] = useState<State>("initial");
	const { device, isDeviceReady } = useDevice();
	const router = useRouter();

	return {
		makeCall,
		sendDigits,
		hangUp,
		state,
	};

	async function makeCall() {
		if (!device || !isDeviceReady) {
			console.error("device is not ready yet, can't make the call");
			return;
		}

		if (state !== "initial") {
			return;
		}

		setState("calling");

		const params = { To: recipient };
		const outgoingConnection = await device.connect({ params });
		setOutgoingConnection(outgoingConnection);
		// @ts-ignore
		window.ddd = outgoingConnection;

		// TODO: remove event listeners
		outgoingConnection.once("accept", (call: Call) => setState("call_in_progress"));
		outgoingConnection.on("cancel", endCall);
		outgoingConnection.on("disconnect", endCall);
		outgoingConnection.on("error", (error) => {
			console.error("call error", error);
			alert(error);
		});
	}

	function endCall() {
		setState("call_ending");
		setTimeout(() => {
			setState("call_ended");
			setTimeout(() => router.replace(Routes.KeypadPage()), 100);
		}, 150);
	}

	function sendDigits(digits: string) {
		return outgoingConnection?.sendDigits(digits);
	}

	function hangUp() {
		setState("call_ending");
		outgoingConnection?.disconnect();
		device?.disconnectAll();
		onHangUp?.();
		router.replace(Routes.KeypadPage());
		outgoingConnection?.off("cancel", endCall);
		outgoingConnection?.off("disconnect", endCall);
	}
}

type State = "initial" | "ready" | "calling" | "call_in_progress" | "call_ending" | "call_ended";
