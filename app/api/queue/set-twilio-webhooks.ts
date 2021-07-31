import { Queue } from "quirrel/blitz"
import twilio from "twilio"

import db from "../../../db"

type Payload = {
	customerId: string
}

const setTwilioWebhooks = Queue<Payload>(
	"api/queue/set-twilio-webhooks",
	async ({ customerId }) => {
		const customer = await db.customer.findFirst({ where: { id: customerId } })
		const twimlApp = customer!.twimlAppSid
			? await twilio(customer!.accountSid!, customer!.authToken!)
					.applications.get(customer!.twimlAppSid)
					.fetch()
			: await twilio(customer!.accountSid!, customer!.authToken!).applications.create({
					friendlyName: "Virtual Phone",
					smsUrl: "https://phone.mokhtar.dev/api/webhook/incoming-message",
					smsMethod: "POST",
					voiceUrl: "https://phone.mokhtar.dev/api/webhook/incoming-call",
					voiceMethod: "POST",
			  })
		const twimlAppSid = twimlApp.sid
		const phoneNumber = await db.phoneNumber.findFirst({ where: { customerId } })

		await Promise.all([
			db.customer.update({
				where: { id: customerId },
				data: { twimlAppSid },
			}),
			twilio(customer!.accountSid!, customer!.authToken!)
				.incomingPhoneNumbers.get(phoneNumber!.phoneNumberSid)
				.update({
					smsApplicationSid: twimlAppSid,
					voiceApplicationSid: twimlAppSid,
				}),
		])
	}
)

export default setTwilioWebhooks
