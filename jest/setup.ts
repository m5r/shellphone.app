import "@testing-library/jest-dom/extend-expect";

jest.mock("next/config", () => () => {
	// see https://github.com/vercel/next.js/issues/4024
	const config = require("../next.config");

	return {
		serverRuntimeConfig: config.serverRuntimeConfig,
		publicRuntimeConfig: config.publicRuntimeConfig,
	};
});

jest.mock("../lib/logger", () => ({
	child: jest.fn().mockReturnValue({
		log: jest.fn(),
		error: jest.fn(),
		debug: jest.fn(),
		warn: jest.fn(),
	}),
}));

export function noop() {
	// exported function to mark the file as a module
}
