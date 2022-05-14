import { DateTime } from "luxon";

export function formatDate(date: Date, config?: Intl.DateTimeFormatOptions): string {
	const dateFormatter = Intl.DateTimeFormat(
		"en-US",
		config ?? {
			day: "2-digit",
			month: "short",
			year: "numeric",
		},
	);

	return dateFormatter.format(date);
}

export function formatTime(date: Date, config?: Intl.DateTimeFormatOptions): string {
	const timeFormatter = Intl.DateTimeFormat(
		"en-US",
		config ?? {
			hour: "2-digit",
			minute: "2-digit",
		},
	);

	return timeFormatter.format(date);
}

export function formatRelativeDate(date: Date): string {
	const dateTime = DateTime.fromJSDate(date);
	const now = new Date();
	const diff = dateTime.diffNow("days");

	const isToday =
		date.getDate() === now.getDate() &&
		date.getMonth() === now.getMonth() &&
		date.getFullYear() === now.getFullYear();
	if (isToday) {
		return dateTime.toFormat("HH:mm", { locale: "en-US" });
	}

	const isYesterday = diff.days >= -2;
	if (isYesterday) {
		return "Yesterday";
	}

	const isDuringLastWeek = diff.days >= -7;
	if (isDuringLastWeek) {
		return dateTime.weekdayLong;
	}

	return dateTime.toFormat("dd/MM/yyyy", { locale: "en-US" });
}
