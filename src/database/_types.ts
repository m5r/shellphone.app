export enum SmsType {
	SENT = "sent",
	RECEIVED = "received",
}

export type Sms = {
	id: number;
	customerId: string;
	content: string;
	from: string;
	to: string;
	type: SmsType;
	sentAt: Date;
};
