jest.mock("next-pwa", () => ({ __esModule: true, default: jest.fn().mockImplementation((config) => config) }));

import { setConfig } from "blitz";

// see https://github.com/vercel/next.js/issues/4024
const config = require("../blitz.config");

setConfig({
	serverRuntimeConfig: config.serverRuntimeConfig,
	publicRuntimeConfig: config.publicRuntimeConfig,
});

jest.mock("../integrations/logger", () => ({
	child: jest.fn().mockReturnValue({
		log: jest.fn(),
		error: jest.fn(),
		debug: jest.fn(),
		warn: jest.fn(),
	}),
}));
