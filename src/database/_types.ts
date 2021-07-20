export enum SmsType {
	SENT = "sent",
	RECEIVED = "received",
}

export type Sms = {
	id: string;
	customerId: string;
	content: string;
	from: string;
	to: string;
	type: SmsType;
	twilioSid?: string;
	// status: sent/delivered/received
	sentAt: string; // timestampz
};
