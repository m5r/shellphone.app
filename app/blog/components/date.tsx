const formatter = Intl.DateTimeFormat("en-US", {
	day: "2-digit",
	month: "short",
	year: "numeric",
});

export default function DateComponent({ dateString }: any) {
	const date = new Date(dateString);
	return <time dateTime={dateString}>{formatter.format(date)}</time>;
}
