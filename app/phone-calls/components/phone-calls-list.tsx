import { useEffect } from "react";
import { Link, Routes } from "blitz";
import { HiPhoneMissedCall, HiPhoneIncoming, HiPhoneOutgoing } from "react-icons/hi";
import clsx from "clsx";

import { Direction, CallStatus } from "db";
import PhoneInitLoader from "app/core/components/phone-init-loader";
import EmptyCalls from "../components/empty-calls";
import usePhoneCalls from "../hooks/use-phone-calls";
import { formatRelativeDate } from "app/core/helpers/date-formatter";
import useCurrentUser from "app/core/hooks/use-current-user";

export default function PhoneCallsList() {
	const { hasOngoingSubscription } = useCurrentUser();
	const [phoneCalls, query] = usePhoneCalls();

	useEffect(() => {
		if (!phoneCalls) {
			const pollInterval = setInterval(() => query.refetch(), 1500);
			return () => clearInterval(pollInterval);
		}
	}, [phoneCalls, query]);

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
						<Link href={Routes.OutgoingCall({ recipient })}>
							<a className="flex flex-row">
								<div className="h-4 w-4 mt-1">
									{isOutboundCall ? <HiPhoneOutgoing className="text-[#C4C4C6]" /> : null}
									{isInboundCall && !isMissedCall ? (
										<HiPhoneIncoming className="text-[#C4C4C6]" />
									) : null}
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
							</a>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
