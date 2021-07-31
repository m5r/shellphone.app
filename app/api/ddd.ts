import { BlitzApiRequest, BlitzApiResponse } from "blitz"

import db from "db"

export default async function ddd(req: BlitzApiRequest, res: BlitzApiResponse) {
	await Promise.all([
		db.message.deleteMany(),
		db.phoneCall.deleteMany(),
		db.phoneNumber.deleteMany(),
		db.customer.deleteMany(),
	])

	await db.user.deleteMany()

	res.status(200).end()
}
