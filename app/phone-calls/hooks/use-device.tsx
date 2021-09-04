import { useCallback, useEffect, useState } from "react";
import { useMutation } from "blitz";
import type { TwilioError } from "@twilio/voice-sdk";
import { Call, Device } from "@twilio/voice-sdk";

import getToken from "../mutations/get-token";
import appLogger from "../../../integrations/logger";

const logger = appLogger.child({ module: "use-device" });

export default function useDevice() {
	const [device, setDevice] = useState<Device | null>(null);
	const [isDeviceReady, setIsDeviceReady] = useState(() => device?.state === Device.State.Registered);
	const [getTokenMutation] = useMutation(getToken);
	const refreshToken = useCallback(async () => {
		if (!device) {
			logger.error("Tried refreshing accessToken for an uninitialized device");
			return;
		}

		const token = await getTokenMutation();
		device.updateToken(token);
	}, [device, getTokenMutation]);

	useEffect(() => {
		const intervalId = setInterval(() => {
			return refreshToken();
		}, (3600 - 30) * 1000);
		return () => clearInterval(intervalId);
	}, [refreshToken]);

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
	}, [getTokenMutation, setDevice]);

	useEffect(() => {
		if (!device) {
			return;
		}

		device.on("registered", onDeviceRegistered);
		device.on("unregistered", onDeviceUnregistered);
		device.on("error", onDeviceError);
		device.on("incoming", onDeviceIncoming);

		return () => {
			device.off("registered", onDeviceRegistered);
			device.off("unregistered", onDeviceUnregistered);
			device.off("error", onDeviceError);
			device.off("incoming", onDeviceIncoming);
		};
	}, [device]);

	return {
		device,
		isDeviceReady,
		refreshToken,
	};

	function onDeviceRegistered() {
		setIsDeviceReady(true);
	}

	function onDeviceUnregistered() {
		setIsDeviceReady(false);
	}

	function onDeviceError(error: TwilioError.TwilioError, call?: Call) {
		// we might have to change this if we instantiate the device on every page to receive calls
		setDevice(() => {
			// hack to trigger the error boundary
			throw error;
		});
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

let e = {
	message:
		"ConnectionError (53000): Raised whenever a signaling connection error occurs that is not covered by a more specific error code.",
	causes: [],
	code: 53000,
	description: "Signaling connection error",
	explanation:
		"Raised whenever a signaling connection error occurs that is not covered by a more specific error code.",
	name: "ConnectionError",
	solutions: [],
};
