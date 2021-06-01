import Router from "@koa/router";

import SmsController from "./controller/sms";
import CallController from "./controller/call";
import { webhookValidator } from "@lifeomic/twilio-webhook-validator-koa";
import config from "./config";

const router = new Router();

router.get("/conversations", SmsController.getConversations);
router.post("/send-sms", SmsController.sendSms);
router.post("/receive-sms", webhookValidator({ authToken: config.twilio.authToken, protocol: "https" }), SmsController.receiveSms);
router.post("/receive-call", webhookValidator({ authToken: config.twilio.authToken, protocol: "https" }), CallController.forwardCall);

export default router;
