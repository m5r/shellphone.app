import Router from "@koa/router";
import { Twilio } from "twilio";
import { getManager } from "typeorm";

import config from "../config";
import { Sms, SmsType } from "../entity/sms";

const client = new Twilio(config.twilio.accountSid, config.twilio.authToken);
const phoneNumber = "+33757592025";
// const from = "Mokhtar";

type Recipient = string;
export type Conversation = Record<Recipient, Sms[]>;

export default class SmsController {
	public static getConversations: Router.Middleware = async (ctx) => {
		const smsRepository = getManager().getRepository(Sms);
		const messages = await smsRepository.find({
			where: [
				{ from: phoneNumber },
				{ to: phoneNumber },
			],
		});
		const conversations = messages.reduce<Conversation>((acc, message) => {
			let recipient: string;
			if (message.type === SmsType.SENT) {
				recipient = message.to;
			} else {
				recipient = message.from;
			}

			if (!acc[recipient]) {
				acc[recipient] = [];
			}

			acc[recipient].push(message);

			return acc;
		}, {});

		ctx.body = conversations;
		ctx.status = 200;
	};

	public static sendSms: Router.Middleware = async (ctx) => {
		const smsRepository = getManager().getRepository(Sms);
		const { to, content } = ctx.request.body;
		await client.messages.create({ body: content, from: phoneNumber, to });
		const sms = new Sms();
		sms.type = SmsType.SENT;
		sms.sentAt = new Date();
		sms.content = content;
		sms.to = to;
		sms.from = phoneNumber;
		await smsRepository.save(sms);

		ctx.status = 200;
	};

	public static receiveSms: Router.Middleware = async (ctx) => {
		const smsRepository = getManager().getRepository(Sms);
		console.log("ctx.request.body", ctx.request.body);
		const body: ReceivedSms = ctx.request.body;
		console.log("body.From", body.From);
		console.log("body.To", body.To);
		console.log("body.Body", body.Body);
		const sms = new Sms();
		sms.type = SmsType.RECEIVED;
		sms.sentAt = new Date();
		sms.content = body.Body;
		sms.to = body.To;
		sms.from = body.From;
		await smsRepository.save(sms);

		ctx.status = 200;
		ctx.body = undefined;
	};
}

type ReceivedSms = {
	ToCountry: string;
	ToState: string;
	SmsMessageSid: string;
	NumMedia: string;
	ToCity: string;
	FromZip: string;
	SmsSid: string;
	FromState: string;
	SmsStatus: string;
	FromCity: string;
	Body: string;
	FromCountry: string;
	To: string;
	ToZip: string;
	NumSegments: string;
	MessageSid: string;
	AccountSid: string;
	From: string;
	ApiVersion: string;
}
