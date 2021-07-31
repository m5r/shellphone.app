import getConfig from "next/config"
import axios from "axios"

const { serverRuntimeConfig } = getConfig()

export async function addSubscriber(email: string) {
	const { apiKey, audienceId } = serverRuntimeConfig.mailChimp
	const region = apiKey.split("-")[1]
	const url = `https://${region}.api.mailchimp.com/3.0/lists/${audienceId}/members`
	const data = {
		email_address: email,
		status: "subscribed",
	}
	const base64ApiKey = Buffer.from(`any:${apiKey}`).toString("base64")
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Basic ${base64ApiKey}`,
	}

	return axios.post(url, data, { headers })
}
