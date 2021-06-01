import Router from "@koa/router";
import { Twilio, twiml } from "twilio";

import config from "../config";

const forwardTo = "+33613370787";

export default class CallController {
	public static forwardCall: Router.Middleware = async (ctx) => {
		const voiceResponse = new twiml.VoiceResponse()
		voiceResponse.dial(forwardTo);

		ctx.status = 200;
	};
}