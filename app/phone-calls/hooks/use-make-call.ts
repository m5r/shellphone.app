import { useEffect, useState } from "react";
import { useMutation } from "blitz";
import { Call, Device, TwilioError } from "@twilio/voice-sdk";

import getToken from "../mutations/get-token";

export default function useMakeCall(recipient: string) {
	const [outgoingConnection, setOutgoingConnection] = useState<Call | null>(null);
	const [device, setDevice] = useState<Device | null>(null);
	const [getTokenMutation] = useMutation(getToken);
	const [state, setState] = useState<State>("initial");

	useEffect(() => {
		(async () => {
			const token = await getTokenMutation();
			const device = new Device(token, {
				codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
				sounds: {
					[Device.SoundName.Disconnect]: undefined, // TODO
				},
			});
			device.register();
			setDevice(device);
		})();
	}, [getTokenMutation]);

	useEffect(() => {
		if (!device) {
			return;
		}

		device.on("error", onDeviceError);
		device.on("registered", onDeviceRegistered);
		device.on("incoming", onDeviceIncoming);

		return () => {
			device.off("error", onDeviceError);
			device.off("registered", onDeviceRegistered);
			device.off("incoming", onDeviceIncoming);
		};
	}, [device]);

	return {
		makeCall,
		sendDigits,
		hangUp,
		state,
	};

	async function makeCall() {
		if (!device) {
			console.error("no device initialized, can't make the call");
			return;
		}

		if (state !== "ready") {
			console.error("not a good time", state);
			return;
		}

		setState("calling");

		const params = { To: recipient };
		const outgoingConnection = await device.connect({ params });
		setOutgoingConnection(outgoingConnection);
		// @ts-ignore
		window.ddd = outgoingConnection;

		outgoingConnection.on("cancel", () => setState("call_ended"));
		outgoingConnection.on("disconnect", () => setState("call_ending"));
		outgoingConnection.on("error", (error) => {
			console.error("call error", error);
			alert(error);
		});
	}

	function sendDigits(digits: string) {
		return outgoingConnection?.sendDigits(digits);
	}

	function hangUp() {
		setState("call_ending");

		if (outgoingConnection) {
			outgoingConnection.reject();
		}

		if (device) {
			device.disconnectAll();
			device.destroy();
		}
	}

	function onDeviceError(error: TwilioError.TwilioError, call?: Call) {
		console.error("device error", error);
		alert(error);
	}

	function onDeviceRegistered() {
		setState("ready");
	}

	function onDeviceIncoming(call: Call) {
		// TODO
		console.log("call", call);
		console.log("Incoming connection from " + call.parameters.From);
		let archEnemyPhoneNumber = "+12093373517";

		if (call.parameters.From === archEnemyPhoneNumber) {
			call.reject();
			console.log("It's your nemesis. Rejected call.");
		} else {
			// accept the incoming connection and start two-way audio
			call.accept();
		}
	}
}

type State = "initial" | "ready" | "calling" | "call_in_progress" | "call_ending" | "call_ended";
