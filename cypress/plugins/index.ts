import db from "~/utils/db.server";

const plugins: Cypress.PluginConfig = (on, config) => {
	on("task", {
		async resetDb() {
			await emptyDatabase();
			return null;
		},
	});

	return {
		...config,
		baseUrl: "http://localhost:3000",
	};
};

module.exports = plugins;

async function emptyDatabase() {
	await db.user.deleteMany();
	await db.organization.deleteMany();
}
