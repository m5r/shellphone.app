import { Fragment } from "react";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { json, useLoaderData } from "superjson-remix";
import { Transition } from "@headlessui/react";
import { IoBackspace, IoCall } from "react-icons/io5";
import { Prisma } from "@prisma/client";

import useKeyPress from "~/features/keypad/hooks/use-key-press";
import useOnBackspacePress from "~/features/keypad/hooks/use-on-backspace-press";
import Keypad from "~/features/keypad/components/keypad";
import BlurredKeypad from "~/features/keypad/components/blurred-keypad";
import MissingTwilioCredentials from "~/features/core/components/missing-twilio-credentials";
import InactiveSubscription from "~/features/core/components/inactive-subscription";
import { getSeoMeta } from "~/utils/seo";
import db from "~/utils/db.server";
import { requireLoggedIn } from "~/utils/auth.server";
import { usePhoneNumber, usePressDigit, useRemoveDigit } from "~/features/keypad/hooks/atoms";

export const meta: MetaFunction = () => ({
	...getSeoMeta({ title: "Keypad" }),
});

type KeypadLoaderData = {
	hasOngoingSubscription: boolean;
	hasPhoneNumber: boolean;
	lastRecipientCalled?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
	const { phoneNumber } = await requireLoggedIn(request);
	const hasOngoingSubscription = true; // TODO
	const hasPhoneNumber = Boolean(phoneNumber);
	const lastCall =
		phoneNumber &&
		(await db.phoneCall.findFirst({
			where: { phoneNumberId: phoneNumber.id },
			orderBy: { createdAt: Prisma.SortOrder.desc },
		}));
	return json<KeypadLoaderData>({
		hasOngoingSubscription,
		hasPhoneNumber,
		lastRecipientCalled: lastCall?.recipient,
	});
};

export default function KeypadPage() {
	const { hasOngoingSubscription, hasPhoneNumber, lastRecipientCalled } = useLoaderData<KeypadLoaderData>();
	const navigate = useNavigate();
	const [phoneNumber, setPhoneNumber] = usePhoneNumber();
	const removeDigit = useRemoveDigit();
	const pressDigit = usePressDigit();
	const onBackspacePress = useOnBackspacePress();
	useKeyPress((key) => {
		if (!hasOngoingSubscription) {
			return;
		}

		if (key === "Backspace") {
			return removeDigit();
		}

		pressDigit(key);
	});

	if (!hasPhoneNumber) {
		return (
			<>
				<MissingTwilioCredentials />
				<BlurredKeypad />
			</>
		);
	}

	if (!hasOngoingSubscription) {
		return (
			<>
				<InactiveSubscription />
				<BlurredKeypad />
			</>
		);
	}

	return (
		<>
			<div className="w-96 h-full flex flex-col justify-around py-5 mx-auto text-center text-black">
				<div className="h-16 text-3xl text-gray-700">
					<span>{phoneNumber}</span>
				</div>

				<Keypad>
					<button
						onClick={async () => {
							if (!hasPhoneNumber || !hasOngoingSubscription) {
								return;
							}

							if (phoneNumber === "") {
								if (lastRecipientCalled) {
									setPhoneNumber(lastRecipientCalled);
								}

								return;
							}

							await navigate(`/outgoing-call/${encodeURI(phoneNumber)}`);
							setPhoneNumber("");
						}}
						className="cursor-pointer select-none col-start-2 h-12 w-12 flex justify-center items-center mx-auto bg-green-800 rounded-full"
					>
						<IoCall className="w-6 h-6 text-white" />
					</button>

					<Transition
						as={Fragment}
						show={phoneNumber.length > 0}
						enter="transition duration-300 ease-in-out"
						enterFrom="transform scale-95 opacity-0"
						enterTo="transform scale-100 opacity-100"
						leave="transition duration-100 ease-out"
						leaveFrom="transform scale-100 opacity-100"
						leaveTo="transform scale-95 opacity-0"
					>
						<div {...onBackspacePress} className="cursor-pointer select-none m-auto">
							<IoBackspace className="w-6 h-6" />
						</div>
					</Transition>
				</Keypad>
			</div>
		</>
	);
}
