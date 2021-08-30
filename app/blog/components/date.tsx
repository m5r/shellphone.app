import { formatDate } from "../../core/helpers/date-formatter";

export default function DateComponent({ dateString }: any) {
	const date = new Date(dateString);
	return <time dateTime={dateString}>{formatDate(date)}</time>;
}
