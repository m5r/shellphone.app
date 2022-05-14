import { Link, useLoaderData } from "@remix-run/react";
import { HiPhoneMissedCall, HiPhoneIncoming, HiPhoneOutgoing } from "react-icons/hi";
import clsx from "clsx";
import { Direction, CallStatus } from "@prisma/client";

import PhoneInitLoader from "~/features/core/components/phone-init-loader";
import EmptyCalls from "../components/empty-calls";
import { formatRelativeDate } from "~/features/core/helpers/date-formatter";
import type { PhoneCallsLoaderData } from "~/routes/__app/calls";

export default function PhoneCallsList() {
	const { hasOngoingSubscription } = { hasOngoingSubscription: false };
	const { phoneCalls } = useLoaderData<PhoneCallsLoaderData>();

	if (!phoneCalls) {
		return hasOngoingSubscription ? <PhoneInitLoader /> : null;
	}

	if (phoneCalls.length === 0) {
		return hasOngoingSubscription ? <EmptyCalls /> : null;
	}

	return (
		<ul className="divide-y">
			{phoneCalls.map((phoneCall) => {
				const isOutboundCall = phoneCall.direction === Direction.Outbound;
				const isInboundCall = phoneCall.direction === Direction.Inbound;
				const isMissedCall = isInboundCall && phoneCall.status === CallStatus.NoAnswer;
				const formattedRecipient = isOutboundCall
					? phoneCall.toMeta.formattedPhoneNumber
					: phoneCall.fromMeta.formattedPhoneNumber;
				const recipient = isOutboundCall ? phoneCall.to : phoneCall.from;

				return (
					<li key={phoneCall.id} className="py-2 px-4 hover:bg-gray-200 hover:bg-opacity-50">
						<Link to={`/outgoing-call/${recipient}`} className="flex flex-row">
							<div className="h-4 w-4 mt-1">
								{isOutboundCall ? <HiPhoneOutgoing className="text-[#C4C4C6]" /> : null}
								{isInboundCall && !isMissedCall ? <HiPhoneIncoming className="text-[#C4C4C6]" /> : null}
								{isInboundCall && isMissedCall ? (
									<HiPhoneMissedCall className="text-[#C4C4C6]" />
								) : null}
							</div>

							<div className="flex flex-col items-start justify-center ml-4">
								<span className={clsx("font-medium", isMissedCall && "text-[#FF362A]")}>
									{formattedRecipient}
								</span>
								<span className="text-[#89898C] text-sm">
									{isOutboundCall ? phoneCall.toMeta.country : phoneCall.fromMeta.country}
								</span>
							</div>

							<span className="text-[#89898C] text-sm self-center ml-auto">
								{formatRelativeDate(new Date(phoneCall.createdAt))}
							</span>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
