import config from "~/config/config.server";

const { webhookId, webhookToken } = config.discord;

export function executeWebhook(email: string) {
	const url = `https://discord.com/api/webhooks/${webhookId}/${webhookToken}`;
	return fetch(url, {
		body: JSON.stringify({ content: `\`${email}\` just joined Shellphone's waitlist` }),
		headers: { "Content-Type": "application/json" },
		method: "post",
	});
}
