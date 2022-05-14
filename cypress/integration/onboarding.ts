describe("onboarding", () => {
	it("should register, invite a colleague, remove them and delete my account", () => {
		const email = "hasbi@test.com";
		const password = "secret password";

		cy.visit("/");

		cy.findByText("Register").click();
		cy.findByLabelText("Organization name").type("Inspect Page Source Gang");
		cy.findByLabelText("Full name").type("Hasbulla Nurmagomedov");
		cy.findByLabelText("Email").type(email);
		cy.findByLabelText("Password").type(`${password}{enter}`);

		cy.findByText("Team").click();
		cy.findByPlaceholderText("colleague@company.com").type("khabib@test.com{enter}");
		cy.findByText("ｘ").click();

		cy.findByText("Sign out").click();

		cy.findByText("Sign in").click();
		cy.findByLabelText("Email").type(email);
		cy.findByLabelText("PasswordForgot your password?").type(`${password}{enter}`);

		cy.findByText("Settings").click();
		cy.findByText("Delete my account").click();
	});
});
