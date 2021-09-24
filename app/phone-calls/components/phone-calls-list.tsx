import { useEffect } from "react";
import { HiPhoneMissedCall, HiPhoneOutgoing } from "react-icons/hi";
import clsx from "clsx";

import { Direction } from "../../../db";
import PhoneInitLoader from "../../core/components/phone-init-loader";
import usePhoneCalls from "../hooks/use-phone-calls";
import { formatRelativeDate } from "../../core/helpers/date-formatter";

export default function PhoneCallsList() {
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
		return <div>empty state</div>;
	}

	return (
		<ul className="divide-y">
			{phoneCalls.map((phoneCall) => {
				const isOutboundCall = phoneCall.direction === Direction.Outbound;
				const isMissedCall = !isOutboundCall && phoneCall.duration === "0"; // TODO
				const recipient = isOutboundCall
					? phoneCall.toMeta.formattedPhoneNumber
					: phoneCall.fromMeta.formattedPhoneNumber;
				return (
					<li key={phoneCall.id} className="flex flex-row py-2 px-4 ml-12">
						<div className="h-4 w-4 mt-1 -ml-12">
							{isOutboundCall ? <HiPhoneOutgoing className="text-[#C4C4C6]" /> : null}
						</div>

						<div className="flex flex-col items-start justify-center ml-4">
							<strong className={clsx(isMissedCall && "text-[#FF362A]")}>{recipient}</strong>
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
