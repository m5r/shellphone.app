import SmsController from "../../src/controller/sms";
import { Sms } from "../../src/entity/sms";
import { getManager } from "typeorm";
import { Context } from "koa";
import { ValidationError, validate } from "class-validator";

const sms: Sms = new Sms();
sms.id = 0;
sms.name = "John";
sms.name = "johndoe@gmail.com";

jest.mock("typeorm", () => {
	const doNothing = () => {
		//Empty function that mocks typeorm annotations
	};

	return {
		getManager: jest.fn(),
		PrimaryGeneratedColumn: doNothing,
		Column: doNothing,
		Entity: doNothing,
		Equal: doNothing,
		Not: doNothing,
		Like: doNothing,
	};
});
jest.mock("class-validator", () => {
	const doNothing = () => {
		//Empty function that mocks typeorm annotations
	};

	return {
		validate: jest.fn(),
		Length: doNothing,
		IsEmail: doNothing,
	};
});

describe("Sms controller", () => {
	it("getUsers should return status 200 and found users.", async () => {
		const userRepository = { find: jest.fn().mockReturnValue([sms]) };
		(getManager as jest.Mock).mockReturnValue({ getRepository: () => userRepository });
		const context = { status: undefined, body: undefined } as Context;
		await SmsController.sendSms(context);
		expect(userRepository.find).toHaveBeenCalledTimes(1);
		expect(context.status).toBe(200);
		expect(context.body).toStrictEqual([sms]);
	});

	it("createUser should return status 201 if is created.", async () => {
		const userRepository = { save: jest.fn().mockReturnValue(sms), findOne: () => undefined as Sms };
		(getManager as jest.Mock).mockReturnValue({ getRepository: () => userRepository });
		(validate as jest.Mock).mockReturnValue([]);
		const context = { status: undefined, body: undefined, request: { body: sms } } as unknown as Context;
		await SmsController.receiveSms(context);
		expect(userRepository.save).toHaveBeenCalledTimes(1);
		expect(context.status).toBe(201);
		expect(context.body).toStrictEqual(sms);
	});
});
