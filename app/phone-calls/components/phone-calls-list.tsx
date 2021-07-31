import { Direction } from "../../../db"
import usePhoneCalls from "../hooks/use-phone-calls"

export default function PhoneCallsList() {
	const phoneCalls = usePhoneCalls()

	if (phoneCalls.length === 0) {
		return <div>empty state</div>
	}

	return (
		<ul className="divide-y">
			{phoneCalls.map((phoneCall) => {
				const recipient = Direction.Outbound ? phoneCall.to : phoneCall.from
				return (
					<li key={phoneCall.twilioSid} className="flex flex-row justify-between py-2">
						<div>{recipient}</div>
						<div>{new Date(phoneCall.createdAt).toLocaleString("fr-FR")}</div>
					</li>
				)
			})}
		</ul>
	)
}
