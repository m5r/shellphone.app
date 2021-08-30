import got from "got";

type Params = {
	id: string;
	token: string;
	content: string;
};

export function executeWebhook({ id, token, content }: Params) {
	const url = `https://discord.com/api/webhooks/${id}/${token}`;
	return got.post(url, { json: { content } });
	// https://discord.com/api/webhooks/881915196245950485/woZmauH3x-qY0mzIn--66NsrAFCJFvFaYrKDCMgfemVQBzdm86GhiowMOnZ_PezXtSV4
}
