import type { NextApiRequest, NextApiResponse } from "next"
import zod from "zod"

import type { ApiError } from "../_types"
import appLogger from "../../../integrations/logger"
import { addSubscriber } from "./_mailchimp"

type Response = {} | ApiError

const logger = appLogger.child({ route: "/api/newsletter/subscribe" })

const bodySchema = zod.object({
	email: zod.string().email(),
})

export default async function subscribeToNewsletter(
	req: NextApiRequest,
	res: NextApiResponse<Response>
) {
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

	let body
	try {
		body = bodySchema.parse(req.body)
	} catch (error) {
		const statusCode = 400
		const apiError: ApiError = {
			statusCode,
			errorMessage: "Body is malformed",
		}
		logger.error(error)

		res.status(statusCode).send(apiError)
		return
	}

	try {
		await addSubscriber(body.email)
	} catch (error) {
		console.log("error", error.response?.data)

		if (error.response?.data.title !== "Member Exists") {
			return res.status(error.response?.status ?? 400).end()
		}
	}

	res.status(200).end()
}
