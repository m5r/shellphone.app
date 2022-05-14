describe("dashboard", () => {
	it("should redirect to login page if user is unauthenticated", () => {
		cy.visit("/test/dashboard");
		cy.url().should("include", "/sign-in");
	});

	it("should redirect to the user's organization if user is trying to access a different one", () => {
		cy.visit("/register");
		cy.findByLabelText("Organization name").type("Inspect Page Source Gang");
		cy.findByLabelText("Full name").type("Hasbulla Nurmagomedov");
		cy.findByLabelText("Email").type("hasbi@test.com");
		cy.findByLabelText("Password").type(`secret password{enter}`);
		cy.url().should("include", "/inspect-page-source-gang/dashboard");

		cy.findByText("Team").click();
		cy.url().should("include", "/inspect-page-source-gang/team");
		cy.visit("/other-org/dashboard");
		cy.url().should("include", "/inspect-page-source-gang/dashboard");
	});
});
