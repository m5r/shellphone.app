import { useRouter } from "blitz";

import Layout from "../core/layouts/layout";

export default function Offline() {
	const router = useRouter();
	return (
		<Layout title="App went offline">
			<h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
				Oops, looks like you went offline.
			</h2>
			<p className="mt-2 text-center text-lg leading-5 text-gray-600">
				Once you&apos;re back online,{" "}
				<button className="inline-flex space-x-2 items-center text-left" onClick={router.reload}>
					<span className="transition-colors duration-150 border-b border-primary-200 hover:border-primary-500">
						reload the page
					</span>
				</button>
			</p>
		</Layout>
	);
}
