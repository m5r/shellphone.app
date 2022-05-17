import deleteUserDataQueue from "./delete-user-data.server";
import fetchPhoneCallsQueue from "./fetch-phone-calls.server";
import insertPhoneCallsQueue from "./insert-phone-calls.server";
import fetchMessagesQueue from "./fetch-messages.server";
import insertMessagesQueue from "./insert-messages.server";

export default [
	deleteUserDataQueue,
	fetchPhoneCallsQueue,
	insertPhoneCallsQueue,
	fetchMessagesQueue,
	insertMessagesQueue,
];
