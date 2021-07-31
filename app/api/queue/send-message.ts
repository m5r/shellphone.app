import { Queue } from "quirrel/blitz"
import twilio from "twilio"

import db from "../../../db"

type Payload = {
	id: string
	customerId: string
	to: string
	content: string
}

const sendMessageQueue = Queue<Payload>(
	"api/queue/send-message",
	async ({ id, customerId, to, content }) => {
		const customer = await db.customer.findFirst({ where: { id: customerId } })
		const phoneNumber = await db.phoneNumber.findFirst({ where: { customerId } })

		const message = await twilio(customer!.accountSid!, customer!.authToken!).messages.create({
			body: content,
			to,
			from: phoneNumber!.phoneNumber,
		})
		await db.message.update({
			where: { id },
			data: { twilioSid: message.sid },
		})
	},
	{
		retry: ["1min"],
	}
)

export default sendMessageQueue
