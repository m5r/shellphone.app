import type { BlitzApiHandler, BlitzApiRequest, BlitzApiResponse } from "blitz";
import { getConfig } from "blitz";
import { PaddleSdk, stringifyMetadata } from "@devoxa/paddle-sdk";

import type { ApiError } from "../../../core/types";
import { subscriptionCreatedHandler } from "../../webhook-handlers/subscription-created";
import { subscriptionPaymentSucceededHandler } from "../../webhook-handlers/subscription-payment-succeeded";
import { subscriptionCancelled } from "../../webhook-handlers/subscription-cancelled";
import { subscriptionUpdated } from "../../webhook-handlers/subscription-updated";
import appLogger from "../../../../integrations/logger";

type SupportedWebhook =
	| "subscription_created"
	| "subscription_cancelled"
	| "subscription_payment_succeeded"
	| "subscription_updated";
const supportedWebhooks: SupportedWebhook[] = [
	"subscription_created",
	"subscription_cancelled",
	"subscription_payment_succeeded",
	"subscription_updated",
];

const handlers: Record<SupportedWebhook, BlitzApiHandler> = {
	subscription_created: subscriptionCreatedHandler,
	subscription_payment_succeeded: subscriptionPaymentSucceededHandler,
	subscription_cancelled: subscriptionCancelled,
	subscription_updated: subscriptionUpdated,
};

function isSupportedWebhook(webhook: any): webhook is SupportedWebhook {
	return supportedWebhooks.includes(webhook);
}

const logger = appLogger.child({ route: "/api/subscription/webhook" });
const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();
const paddleSdk = new PaddleSdk({
	publicKey: serverRuntimeConfig.paddle.publicKey,
	vendorId: publicRuntimeConfig.paddle.vendorId,
	vendorAuthCode: serverRuntimeConfig.paddle.apiKey,
	metadataCodec: stringifyMetadata(),
});

export default async function webhook(req: BlitzApiRequest, res: BlitzApiResponse) {
	if (req.method !== "POST") {
		const statusCode = 405;
		const apiError: ApiError = {
			statusCode,
			errorMessage: `Method ${req.method} Not Allowed`,
		};
		logger.error(apiError);

		res.setHeader("Allow", ["POST"]);
		res.status(statusCode).send(apiError);
		return;
	}

	if (!paddleSdk.verifyWebhookEvent(req.body)) {
		const statusCode = 500;
		const apiError: ApiError = {
			statusCode,
			errorMessage: "Webhook event is invalid",
		};
		logger.error(apiError);

		return res.status(statusCode).send(apiError);
	}

	const alertName = req.body.alert_name;
	logger.info(`Received ${alertName} webhook`);
	logger.info(req.body);
	if (isSupportedWebhook(alertName)) {
		return handlers[alertName](req, res);
	}

	return res.status(400).end();
}
