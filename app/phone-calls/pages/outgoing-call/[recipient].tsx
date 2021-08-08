import type { BlitzPage } from "blitz";
import { Routes, useMutation, useRouter } from "blitz";
import type { FunctionComponent } from "react";
import { useEffect, useRef, useState } from "react";
import { atom, useAtom } from "jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt as faPhone } from "@fortawesome/pro-solid-svg-icons";
import { usePress } from "@react-aria/interactions";
import type { TwilioError } from "@twilio/voice-sdk";
import { Device, Call } from "@twilio/voice-sdk";

import getToken from "../../mutations/get-token";
import useRequireOnboarding from "../../../core/hooks/use-require-onboarding";

const OutgoingCall: BlitzPage = () => {
	const router = useRouter();
	const recipient = decodeURIComponent(router.params.recipient);
	const [device, setDevice] = useState<Device | null>(null);
	const [getTokenMutation] = useMutation(getToken);
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

	return (
		<div className="w-96 h-full flex flex-col justify-around py-5 mx-auto text-center text-black bg-white">
			<div className="h-16 text-3xl text-gray-700">
				<span>{phoneNumber}</span>
			</div>

			<section>
				<Row>
					<Digit digit="1" />
					<Digit digit="2">
						<DigitLetters>ABC</DigitLetters>
					</Digit>
					<Digit digit="3">
						<DigitLetters>DEF</DigitLetters>
					</Digit>
				</Row>
				<Row>
					<Digit digit="4">
						<DigitLetters>GHI</DigitLetters>
					</Digit>
					<Digit digit="5">
						<DigitLetters>JKL</DigitLetters>
					</Digit>
					<Digit digit="6">
						<DigitLetters>MNO</DigitLetters>
					</Digit>
				</Row>
				<Row>
					<Digit digit="7">
						<DigitLetters>PQRS</DigitLetters>
					</Digit>
					<Digit digit="8">
						<DigitLetters>TUV</DigitLetters>
					</Digit>
					<Digit digit="9">
						<DigitLetters>WXYZ</DigitLetters>
					</Digit>
				</Row>
				<Row>
					<Digit digit="*" />
					<ZeroDigit />
					<Digit digit="#" />
				</Row>
				<Row>
					<div
						onClick={makeCall}
						className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-red-800 rounded-full"
					>
						<FontAwesomeIcon className="w-6 h-6" icon={faPhone} color="white" size="lg" />
					</div>
				</Row>
			</section>
		</div>
	);
};

const ZeroDigit: FunctionComponent = () => {
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pressDigit = useAtom(pressDigitAtom)[1];
	const longPressDigit = useAtom(longPressDigitAtom)[1];
	const { pressProps } = usePress({
		onPressStart() {
			pressDigit("0");
			timeoutRef.current = setTimeout(() => {
				longPressDigit("+");
			}, 750);
		},
		onPressEnd() {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		},
	});

	return (
		<div {...pressProps} className="text-3xl cursor-pointer select-none">
			0 <DigitLetters>+</DigitLetters>
		</div>
	);
};

const Row: FunctionComponent = ({ children }) => (
	<div className="grid grid-cols-3 p-4 my-0 mx-auto text-black">{children}</div>
);

const Digit: FunctionComponent<{ digit: string }> = ({ children, digit }) => {
	const pressDigit = useAtom(pressDigitAtom)[1];
	const { pressProps } = usePress({
		onPress() {
			pressDigit(digit);
		},
	});

	return (
		<div {...pressProps} className="text-3xl cursor-pointer select-none">
			{digit}
			{children}
		</div>
	);
};

const DigitLetters: FunctionComponent = ({ children }) => <div className="text-xs text-gray-600">{children}</div>;

const phoneNumberAtom = atom("");
const pressDigitAtom = atom(null, (get, set, digit: string) => {
	if (get(phoneNumberAtom).length > 17) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState + digit);
});
const longPressDigitAtom = atom(null, (get, set, replaceWith: string) => {
	if (get(phoneNumberAtom).length > 17) {
		return;
	}

	set(phoneNumberAtom, (prevState) => prevState.slice(0, -1) + replaceWith);
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
