import { useCallback, useEffect } from "react";
import type { Call } from "@twilio/voice-sdk";
import { atom, useAtom } from "jotai";

export default function useCall() {
	const [call, setCall] = useAtom(callAtom);
	const endCall = useCallback(
		function endCallFn() {
			call?.removeListener("cancel", endCall);
			call?.removeListener("disconnect", endCall);
			call?.disconnect();
			setCall(null);
		},
		[call, setCall],
	);
	const onError = useCallback(
		function onErrorFn(error: any) {
			call?.removeListener("cancel", endCall);
			call?.removeListener("disconnect", endCall);
			call?.disconnect();
			setCall(null);
			throw error; // TODO: might not get caught by error boundary
		},
		[call, setCall, endCall],
	);

	const eventHandlers = [
		["error", onError],
		["cancel", endCall],
		["disconnect", endCall],
	] as const;
	for (const [eventName, handler] of eventHandlers) {
		// register call event handlers
		// one event at a time to only update the handlers that changed
		// without resetting the other handlers

		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (!call) {
				return;
			}

			// if we already have this event handler registered, no need to re-register it
			const listeners = call.listeners(eventName);
			if (listeners.length > 0 && listeners.every((fn) => fn.toString() === handler.toString())) {
				return;
			}

			call.on(eventName, handler);

			return () => {
				call.removeListener(eventName, handler);
			};
		}, [call, setCall, eventName, handler]);
	}

	return [call, setCall] as const;
}

const callAtom = atom<Call | null>(null);
