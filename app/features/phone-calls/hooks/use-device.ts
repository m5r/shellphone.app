import { useEffect, useState } from "react";
import { type TwilioError, Call, Device } from "@twilio/voice-sdk";
import { useFetcher } from "@remix-run/react";

import type { TwilioTokenLoaderData } from "~/features/phone-calls/loaders/twilio-token";

export default function useDevice() {
	const jwt = useDeviceToken();
	const [device, setDevice] = useState<Device | null>(null);
	const [isDeviceReady, setIsDeviceReady] = useState(() => device?.state === Device.State.Registered);

	useEffect(() => {
		jwt.refresh();
	}, []);

	useEffect(() => {
		if (jwt.token && device?.state === Device.State.Registered && device?.token !== jwt.token) {
			device.updateToken(jwt.token);
		}
	}, [jwt.token, device]);

	useEffect(() => {
		if (!jwt.token || device?.state === Device.State.Registered) {
			return;
		}

		const newDevice = new Device(jwt.token, {
			codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
			sounds: {
				[Device.SoundName.Disconnect]: undefined, // TODO
			},
		});
		newDevice.register(); // TODO throwing an error
		setDevice(newDevice);
	}, [device?.state, jwt.token, setDevice]);

	useEffect(() => {
		if (!device) {
			return;
		}

		device.on("registered", onDeviceRegistered);
		device.on("unregistered", onDeviceUnregistered);
		device.on("error", onDeviceError);
		device.on("incoming", onDeviceIncoming);
		device.on("tokenWillExpire", onTokenWillExpire);

		return () => {
			if (typeof device.off !== "function") {
				return;
			}

			device.off("registered", onDeviceRegistered);
			device.off("unregistered", onDeviceUnregistered);
			device.off("error", onDeviceError);
			device.off("incoming", onDeviceIncoming);
			device.off("tokenWillExpire", onTokenWillExpire);
		};
	}, [device]);

	return {
		device,
		isDeviceReady,
	};

	function onTokenWillExpire() {
		jwt.refresh();
	}

	function onDeviceRegistered() {
		setIsDeviceReady(true);
	}

	function onDeviceUnregistered() {
		setIsDeviceReady(false);
	}

	function onDeviceError(error: TwilioError.TwilioError, call?: Call) {
		console.log("error", error);
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

function useDeviceToken() {
	const fetcher = useFetcher<TwilioTokenLoaderData>();

	return {
		token: fetcher.data,
		refresh: () => fetcher.load("/outgoing-call/twilio-token"),
	};
}
