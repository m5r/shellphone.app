import type { FunctionComponent, ReactChild } from "react";

type AlertVariant = "error" | "success" | "info" | "warning";

type AlertVariantProps = {
	backgroundColor: string;
	titleTextColor: string;
	messageTextColor: string;
};

type Props = {
	title: ReactChild;
	message: ReactChild;
	variant: AlertVariant;
};

const ALERT_VARIANTS: Record<AlertVariant, AlertVariantProps> = {
	error: {
		backgroundColor: "bg-red-50",
		titleTextColor: "text-red-800",
		messageTextColor: "text-red-700",
	},
	success: {
		backgroundColor: "bg-green-50",
		titleTextColor: "text-green-800",
		messageTextColor: "text-green-700",
	},
	info: {
		backgroundColor: "bg-primary-50",
		titleTextColor: "text-primary-800",
		messageTextColor: "text-primary-700",
	},
	warning: {
		backgroundColor: "bg-yellow-50",
		titleTextColor: "text-yellow-800",
		messageTextColor: "text-yellow-700",
	},
};

const Alert: FunctionComponent<Props> = ({ title, message, variant }) => {
	const variantProperties = ALERT_VARIANTS[variant];

	return (
		<div className={`rounded-md p-4 ${variantProperties.backgroundColor}`}>
			<h3 className={`text-sm leading-5 font-medium ${variantProperties.titleTextColor}`}>{title}</h3>
			<div className={`mt-2 text-sm leading-5 ${variantProperties.messageTextColor}`}>{message}</div>
		</div>
	);
};

export default Alert;
