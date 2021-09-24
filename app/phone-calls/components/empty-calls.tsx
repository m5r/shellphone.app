import { Link, Routes } from "blitz";
import { HiPlus } from "react-icons/hi";

export default function EmptyMessages() {
	return (
		<div className="text-center my-auto">
			<svg
				className="mx-auto h-12 w-12 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 48 48"
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286M30 14a6 6 0 11-12 0 6 6 0 0112 0zm12 6a4 4 0 11-8 0 4 4 0 018 0zm-28 0a4 4 0 11-8 0 4 4 0 018 0z"
				/>
			</svg>
			<h3 className="mt-2 text-sm font-medium text-gray-900">No phone calls</h3>
			<p className="mt-1 text-sm text-gray-500">Get started by calling someone you know.</p>
			<div className="mt-6">
				<Link href={Routes.KeypadPage()}>
					<a className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#007AFF] focus:outline-none focus:ring-2 focus:ring-offset-2">
						<HiPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
						Open keypad
					</a>
				</Link>
			</div>
		</div>
	);
}
