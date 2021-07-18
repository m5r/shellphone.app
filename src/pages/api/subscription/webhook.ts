import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { PaddleSdk, stringifyMetadata } from "@devoxa/paddle-sdk";

import { subscriptionCreatedHandler } from "./_subscription-created";
import { subscriptionPaymentSucceededHandler } from "./_subscription-payment-succeeded";
import { subscriptionCancelled } from "./_subscription-cancelled";
import { subscriptionUpdated } from "./_subscription-updated";
import type { ApiError } from "../_types";
import appLogger from "../../../../lib/logger";

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

const handlers: Record<SupportedWebhook, NextApiHandler> = {
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

export default async function webhook(
	req: NextApiRequest,
	res: NextApiResponse,
) {
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
	if (isSupportedWebhook(alertName)) {
		return handlers[alertName](req, res);
	}

	return res.status(400).end();
}
