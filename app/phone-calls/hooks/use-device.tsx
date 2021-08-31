import { useEffect } from "react";
import { useMutation } from "blitz";
import type { TwilioError } from "@twilio/voice-sdk";
import { Call, Device } from "@twilio/voice-sdk";
import { atom, useAtom } from "jotai";

import getToken from "../mutations/get-token";

export default function useDevice() {
	const [device, setDevice] = useAtom(deviceAtom);
	const [getTokenMutation] = useMutation(getToken);

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

		(window as any).device = device;
		device.on("error", onDeviceError);
		device.on("incoming", onDeviceIncoming);

		return () => {
			device.off("error", onDeviceError);
			device.off("incoming", onDeviceIncoming);
		};
	}, [device]);

	return device;

	function onDeviceError(error: TwilioError.TwilioError, call?: Call) {
		// TODO gracefully handle errors: possibly hang up the call, redirect to keypad
		console.error("device error", error);
		alert(error);
	}

	function onDeviceIncoming(call: Call) {
		// TODO show alert to accept/reject the incoming call /!\ it should persist between screens /!\ prevent making a new call when there is a pending incoming call
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

const deviceAtom = atom<Device | null>(null);