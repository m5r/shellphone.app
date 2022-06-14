import { useCallback, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { type TwilioError, Call, Device } from "@twilio/voice-sdk";
import { useAtom, atom } from "jotai";

import type { TwilioTokenLoaderData } from "~/features/phone-calls/loaders/twilio-token";
import type { NotificationPayload } from "~/utils/web-push.server";
import useCall from "./use-call";

export default function useDevice() {
	const jwt = useDeviceToken();
	const [device, setDevice] = useAtom(deviceAtom);
	const [call, setCall] = useCall();
	const [isDeviceReady, setIsDeviceReady] = useAtom(isDeviceReadyAtom);

	useEffect(() => {
		// init token
		jwt.refresh();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// init device
		if (!jwt.token) {
			return;
		}
		if (device && device.state !== Device.State.Unregistered) {
			return;
		}

		const newDevice = new Device(jwt.token, {
			codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
			sounds: {
				[Device.SoundName.Disconnect]: undefined, // TODO
			},
		});
		newDevice.register();
		(window as any).ddd = newDevice;
		setDevice(newDevice);
	}, [device, jwt.token, setDevice]);

	useEffect(() => {
		// refresh token
		if (jwt.token && device?.state === Device.State.Registered && device?.token !== jwt.token) {
			device.updateToken(jwt.token);
		}
	}, [device, jwt.token]);

	const onTokenWillExpire = useCallback(
		function onTokenWillExpire() {
			jwt.refresh();
		},
		[jwt.refresh],
	);

	const onDeviceRegistered = useCallback(
		function onDeviceRegistered() {
			setIsDeviceReady(true);
		},
		[setIsDeviceReady],
	);
	const onDeviceUnregistered = useCallback(
		function onDeviceUnregistered() {
			setIsDeviceReady(false);
		},
		[setIsDeviceReady],
	);
	const onDeviceError = useCallback(function onDeviceError(error: TwilioError.TwilioError, call?: Call) {
		console.log("error", error);
		// we might have to change this if we instantiate the device on every page to receive calls
		// setDevice(() => {
		// hack to trigger the error boundary
		throw error;
		// });
	}, []);
	const onDeviceIncoming = useCallback(
		function onDeviceIncoming(incomingCall: Call) {
			if (call) {
				incomingCall.reject();
				return;
			}

			setCall(incomingCall);
			console.log("incomingCall.parameters", incomingCall.parameters);
			// TODO prevent making a new call when there is a pending incoming call
			const channel = new BroadcastChannel("notifications");
			const recipient = incomingCall.parameters.From;
			const message: NotificationPayload = {
				title: recipient, // TODO:
				body: "",
				actions: [
					{
						action: "answer",
						title: "Answer",
					},
					{
						action: "decline",
						title: "Decline",
					},
				],
				data: { recipient, type: "call" },
			};
			channel.postMessage(JSON.stringify(message));
		},
		[call, setCall],
	);
	const eventHandlers = [
		["registered", onDeviceRegistered],
		["unregistered", onDeviceUnregistered],
		["error", onDeviceError],
		["incoming", onDeviceIncoming],
		["tokenWillExpire", onTokenWillExpire],
	] as const;
	for (const [eventName, handler] of eventHandlers) {
		// register device event handlers
		// one event at a time to only update the handlers that changed
		// without resetting the other handlers

		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (!device) {
				return;
			}

			// if we already have this event handler registered, no need to re-register it
			const listeners = device.listeners(eventName);
			if (listeners.length > 0 && listeners.every((fn) => fn.toString() === handler.toString())) {
				return;
			}

			device.on(eventName, handler);

			return () => {
				device.removeListener(eventName, handler);
			};
		}, [device, eventName, handler]);
	}

	return {
		device,
		isDeviceReady,
	};
}

const deviceAtom = atom<Device | null>(null);
const isDeviceReadyAtom = atom(false);

function useDeviceToken() {
	const fetcher = useFetcher<TwilioTokenLoaderData>();
	const refresh = useCallback(() => fetcher.load("/outgoing-call/twilio-token"), []);

	return {
		token: fetcher.data,
		refresh,
	};
}
