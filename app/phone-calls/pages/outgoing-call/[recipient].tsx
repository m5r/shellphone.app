import type { BlitzPage } from "blitz";
import { Routes, useMutation, useRouter } from "blitz";
import { useEffect, useMemo, useState } from "react";
import { atom, useAtom } from "jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt as faPhone } from "@fortawesome/pro-solid-svg-icons";
import type { TwilioError } from "@twilio/voice-sdk";
import { Device, Call } from "@twilio/voice-sdk";

import getToken from "../../mutations/get-token";
import useRequireOnboarding from "../../../core/hooks/use-require-onboarding";
import Keypad from "../../components/keypad";

const OutgoingCall: BlitzPage = () => {
	const router = useRouter();
	const recipient = decodeURIComponent(router.params.recipient);
	const [outgoingConnection, setOutgoingConnection] = useState<Call | null>(null);
	const [device, setDevice] = useState<Device | null>(null);
	const [getTokenMutation] = useMutation(getToken);
	const [deviceState, setDeviceState] = useState<DeviceState>("initial");

	async function makeCall() {
		const token = await getTokenMutation();
		console.log("token", token);
		const device = new Device(token, { codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU] });
		setDevice(device);

		const params = { To: recipient };
		const outgoingConnection = await device.connect({ params });
		// @ts-ignore
		window.ddd = outgoingConnection;

		/*$("[id^=dial-]").click(function (event) {
			console.log("send digit", event.target.innerText);
			outgoingConnection.sendDigits(event.target.innerText);
		})*/

		outgoingConnection.on("ringing", () => {
			console.log("Ringing...");
		});
	}

	useEffect(() => {
		// make call
	});

	useEffect(() => {
		if (!device) {
			return;
		}

		device.on("ready", onDeviceReady);
		device.on("error", onDeviceError);
		device.on("register", onDeviceRegistered);
		device.on("unregister", onDeviceUnregistered);
		device.on("incoming", onDeviceIncoming);
		// device.audio?.on('deviceChange', updateAllDevices.bind(device));

		return () => {
			device.off("ready", onDeviceReady);
			device.off("error", onDeviceError);
			device.off("register", onDeviceRegistered);
			device.off("unregister", onDeviceUnregistered);
			device.off("incoming", onDeviceIncoming);
		};
	}, [device]);

	useRequireOnboarding();
	const phoneNumber = useAtom(phoneNumberAtom)[0];
	const pressDigit = useAtom(pressDigitAtom)[1];
	const onDigitPressProps = useMemo(
		() => (digit: string) => ({
			onPress() {
				pressDigit(digit);

				if (outgoingConnection) {
					outgoingConnection.sendDigits(digit);
				}
			},
		}),
		[outgoingConnection, pressDigit],
	);
	const hangUp = useMemo(
		() => () => {
			if (outgoingConnection) {
				outgoingConnection.reject();
			}

			if (device) {
				device.disconnectAll();
				device.destroy();
				device.unregister();
			}

			// return router.replace(Routes.KeypadPage());
			return router.push(Routes.KeypadPage());
		},
		[device, outgoingConnection, router],
	);

	return (
		<div className="w-96 h-full flex flex-col justify-around py-5 mx-auto text-center text-black bg-white">
			<div className="h-16 text-3xl text-gray-700">
				<span>{recipient}</span>
			</div>

			<div className="h-16 text-2xl text-gray-600">
				<span>{phoneNumber}</span>
			</div>

			<Keypad onDigitPressProps={onDigitPressProps} onZeroPressProps={onDigitPressProps("0")}>
				<div
					onClick={hangUp}
					className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-red-800 rounded-full"
				>
					<FontAwesomeIcon className="w-6 h-6" icon={faPhone} color="white" size="lg" />
				</div>
			</Keypad>
		</div>
	);
};

type DeviceState = "initial" | "";

const phoneNumberAtom = atom("");
const pressDigitAtom = atom(null, (get, set, digit: string) => {
	if (get(phoneNumberAtom).length > 17) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState + digit);
});

OutgoingCall.authenticate = { redirectTo: Routes.SignIn() };

function onDeviceReady(device: Device) {
	console.log("device", device);
}

function onDeviceError(error: TwilioError.TwilioError, call?: Call) {
	console.log("error", error);
}

function onDeviceRegistered(device: Device) {
	console.log("ready to make calls");
	console.log("device", device);
}

function onDeviceUnregistered() {}

function onDeviceIncoming(call: Call) {
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

export default OutgoingCall;
