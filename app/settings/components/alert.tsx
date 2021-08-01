import type { ReactElement } from "react";

type AlertVariant = "error" | "success" | "info" | "warning";

type AlertVariantProps = {
	backgroundColor: string;
	icon: ReactElement;
	titleTextColor: string;
	messageTextColor: string;
};

type Props = {
	title: string;
	message: string;
	variant: AlertVariant;
};

const ALERT_VARIANTS: Record<AlertVariant, AlertVariantProps> = {
	error: {
		backgroundColor: "bg-red-50",
		icon: (
			<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
				<path
					fillRule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
					clipRule="evenodd"
				/>
			</svg>
		),
		titleTextColor: "text-red-800",
		messageTextColor: "text-red-700",
	},
	success: {
		backgroundColor: "bg-green-50",
		icon: (
			<svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
				<path
					fillRule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
					clipRule="evenodd"
				/>
			</svg>
		),
		titleTextColor: "text-green-800",
		messageTextColor: "text-green-700",
	},
	info: {
		backgroundColor: "bg-primary-50",
		icon: (
			<svg className="h-5 w-5 text-primary-400" viewBox="0 0 20 20" fill="currentColor">
				<path
					fillRule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
					clipRule="evenodd"
				/>
			</svg>
		),
		titleTextColor: "text-primary-800",
		messageTextColor: "text-primary-700",
	},
	warning: {
		backgroundColor: "bg-yellow-50",
		icon: (
			<svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
				<path
					fillRule="evenodd"
					d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
					clipRule="evenodd"
				/>
			</svg>
		),
		titleTextColor: "text-yellow-800",
		messageTextColor: "text-yellow-700",
	},
};

export default function Alert({ title, message, variant }: Props) {
	const variantProperties = ALERT_VARIANTS[variant];

	return (
		<div className={`rounded-md p-4 ${variantProperties.backgroundColor}`}>
			<div className="flex">
				<div className="flex-shrink-0">{variantProperties.icon}</div>
				<div className="ml-3">
					<h3
						className={`text-sm leading-5 font-medium ${variantProperties.titleTextColor}`}
					>
						{title}
					</h3>
					<div className={`mt-2 text-sm leading-5 ${variantProperties.messageTextColor}`}>
						{message}
					</div>
				</div>
			</div>
		</div>
	);
}