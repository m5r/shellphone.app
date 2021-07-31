import type { NextApiRequest, NextApiResponse } from "next"
import twilio from "twilio"

import type { ApiError } from "../../../api/_types"
import appLogger from "../../../../integrations/logger"
import { encrypt } from "../../../../db/_encryption"
import db, { Direction, MessageStatus } from "../../../../db"
import { MessageInstance } from "twilio/lib/rest/api/v2010/account/message"

const logger = appLogger.child({ route: "/api/webhook/incoming-message" })

export default async function incomingMessageHandler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		const statusCode = 405
		const apiError: ApiError = {
			statusCode,
			errorMessage: `Method ${req.method} Not Allowed`,
		}
		logger.error(apiError)

		res.setHeader("Allow", ["POST"])
		res.status(statusCode).send(apiError)
		return
	}

	const twilioSignature = req.headers["X-Twilio-Signature"] || req.headers["x-twilio-signature"]
	if (!twilioSignature || Array.isArray(twilioSignature)) {
		const statusCode = 400
		const apiError: ApiError = {
			statusCode,
			errorMessage: "Invalid header X-Twilio-Signature",
		}
		logger.error(apiError)

		res.status(statusCode).send(apiError)
		return
	}

	console.log("req.body", req.body)
	try {
		const phoneNumber = req.body.To
		const customerPhoneNumber = await db.phoneNumber.findFirst({
			where: { phoneNumber },
		})
		const customer = await db.customer.findFirst({
			where: { id: customerPhoneNumber!.customerId },
		})
		const url = "https://phone.mokhtar.dev/api/webhook/incoming-message"
		const isRequestValid = twilio.validateRequest(
			customer!.authToken!,
			twilioSignature,
			url,
			req.body
		)
		if (!isRequestValid) {
			const statusCode = 400
			const apiError: ApiError = {
				statusCode,
				errorMessage: "Invalid webhook",
			}
			logger.error(apiError)

			res.status(statusCode).send(apiError)
			return
		}

		await db.message.create({
			data: {
				customerId: customer!.id,
				to: req.body.To,
				from: req.body.From,
				status: MessageStatus.Received,
				direction: Direction.Inbound,
				sentAt: req.body.DateSent,
				content: encrypt(req.body.Body, customer!.encryptionKey),
			},
		})
	} catch (error) {
		const statusCode = error.statusCode ?? 500
		const apiError: ApiError = {
			statusCode,
			errorMessage: error.message,
		}
		logger.error(error)

		res.status(statusCode).send(apiError)
	}
}

function translateDirection(direction: MessageInstance["direction"]): Direction {
	switch (direction) {
		case "inbound":
			return Direction.Inbound
		case "outbound-api":
		case "outbound-call":
		case "outbound-reply":
		default:
			return Direction.Outbound
	}
}

function translateStatus(status: MessageInstance["status"]): MessageStatus {
	switch (status) {
		case "accepted":
			return MessageStatus.Accepted
		case "canceled":
			return MessageStatus.Canceled
		case "delivered":
			return MessageStatus.Delivered
		case "failed":
			return MessageStatus.Failed
		case "partially_delivered":
			return MessageStatus.PartiallyDelivered
		case "queued":
			return MessageStatus.Queued
		case "read":
			return MessageStatus.Read
		case "received":
			return MessageStatus.Received
		case "receiving":
			return MessageStatus.Receiving
		case "scheduled":
			return MessageStatus.Scheduled
		case "sending":
			return MessageStatus.Sending
		case "sent":
			return MessageStatus.Sent
		case "undelivered":
			return MessageStatus.Undelivered
	}
}
