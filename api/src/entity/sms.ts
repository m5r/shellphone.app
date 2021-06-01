import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from "typeorm";
import { Length, IsPhoneNumber } from "class-validator";

export enum SmsType {
	SENT = "sent",
	RECEIVED = "received",
}

@Entity()
export class Sms {
	@PrimaryGeneratedColumn()
	id: number;

	@Column("text")
	@Length(1, 10000)
	content: string;

	@Index()
	@Column("text")
	@IsPhoneNumber()
	from: string;

	@Index()
	@Column("text")
	@IsPhoneNumber()
	to: string;

	@Column({
		type: "enum",
		enum: SmsType,
	})
	type: SmsType;

	@CreateDateColumn()
	sentAt: Date;
}
