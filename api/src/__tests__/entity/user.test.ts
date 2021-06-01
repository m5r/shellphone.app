import { Sms } from "../../src/entity/user";

test("user", () => {
	const user = new Sms();
	user.name = "John Doe";
	user.email = "johndoe@gmail.com";
	expect(user.name).toBe("John Doe");
	expect(user.email).toBe("johndoe@gmail.com");
});
