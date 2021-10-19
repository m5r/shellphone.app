import { useEffect } from "react";
import { HiPhoneMissedCall, HiPhoneIncoming, HiPhoneOutgoing } from "react-icons/hi";
import clsx from "clsx";

import { Direction, CallStatus } from "db";
import PhoneInitLoader from "app/core/components/phone-init-loader";
import EmptyCalls from "../components/empty-calls";
import usePhoneCalls from "../hooks/use-phone-calls";
import { formatRelativeDate } from "app/core/helpers/date-formatter";
import useCurrentUser from "app/core/hooks/use-current-user";

export default function PhoneCallsList() {
	const { hasActiveSubscription } = useCurrentUser();
	const [phoneCalls, query] = usePhoneCalls();

	useEffect(() => {
		if (!phoneCalls) {
			const pollInterval = setInterval(() => query.refetch(), 1500);
			return () => clearInterval(pollInterval);
		}
	}, [phoneCalls, query]);

	if (!phoneCalls) {
		return <PhoneInitLoader />;
	}

	if (phoneCalls.length === 0) {
		return hasActiveSubscription ? <EmptyCalls /> : null;
	}

	return (
		<ul className="divide-y">
			{phoneCalls.map((phoneCall) => {
				const isOutboundCall = phoneCall.direction === Direction.Outbound;
				const isInboundCall = phoneCall.direction === Direction.Inbound;
				const isMissedCall = isInboundCall && phoneCall.status === CallStatus.NoAnswer;
				const recipient = isOutboundCall
					? phoneCall.toMeta.formattedPhoneNumber
					: phoneCall.fromMeta.formattedPhoneNumber;
				return (
					<li key={phoneCall.id} className="flex flex-row py-2 px-4 ml-12">
						<div className="h-4 w-4 mt-1 -ml-12">
							{isOutboundCall ? <HiPhoneOutgoing className="text-[#C4C4C6]" /> : null}
							{isInboundCall && !isMissedCall ? <HiPhoneIncoming className="text-[#C4C4C6]" /> : null}
							{isInboundCall && isMissedCall ? <HiPhoneMissedCall className="text-[#C4C4C6]" /> : null}
						</div>

						<div className="flex flex-col items-start justify-center ml-4">
							<span className={clsx("font-medium", isMissedCall && "text-[#FF362A]")}>{recipient}</span>
							<span className="text-[#89898C] text-sm">
								{isOutboundCall ? phoneCall.toMeta.country : phoneCall.fromMeta.country}
							</span>
						</div>

						<span className="text-[#89898C] text-sm self-center ml-auto">
							{formatRelativeDate(new Date(phoneCall.createdAt))}
						</span>
					</li>
				);
			})}
		</ul>
	);
}
