import { setConfig } from "blitz";

import { config } from "../blitz.config";

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
