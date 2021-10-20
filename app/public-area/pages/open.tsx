import type { BlitzPage } from "blitz";
import { useQuery } from "blitz";

import getMetrics from "../queries/get-metrics";

import Layout from "../components/layout";

const initialData = {
	users: 0,
	phoneNumbers: 0,
	smsExchanged: 0,
	minutesCalled: 0,
	averageMinutesCalled: 0,
};

const OpenMetrics: BlitzPage = () => {
	const [metrics] = useQuery(getMetrics, {}, { suspense: false, initialData });
	const { users, phoneNumbers, smsExchanged, minutesCalled, averageMinutesCalled } = metrics ?? initialData;

	return (
		<dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
			<Card title="Users" value={users} />
			<Card title="Phone Numbers Registered" value={phoneNumbers} />
			<Card title="SMS Exchanged" value={smsExchanged} />
			<Card title="Minutes on Call" value={minutesCalled} />
			<Card title="Avg Call Length in Minutes" value={averageMinutesCalled} />
		</dl>
	);
};

function Card({ title, value }: { title: string; value: number | string }) {
	return (
		<div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
			<dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
			<dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
		</div>
	);
}

OpenMetrics.getLayout = (page) => <Layout title="Open Metrics">{page}</Layout>;
OpenMetrics.suppressFirstRenderFlicker = true;

export default OpenMetrics;
