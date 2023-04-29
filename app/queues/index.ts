import fetchPhoneCallsQueue from "./fetch-phone-calls.server";
import insertPhoneCallsQueue from "./insert-phone-calls.server";
import fetchMessagesQueue from "./fetch-messages.server";
import insertMessagesQueue from "./insert-messages.server";
import setTwilioWebhooksQueue from "./set-twilio-webhooks.server";
import setTwilioApiKeyQueue from "./set-twilio-api-key.server";

export default [
	fetchPhoneCallsQueue,
	insertPhoneCallsQueue,
	fetchMessagesQueue,
	insertMessagesQueue,
	setTwilioWebhooksQueue,
	setTwilioApiKeyQueue,
];
