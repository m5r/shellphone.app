export default function PhoneInitLoader() {
	return (
		<div className="px-4 my-auto text-center space-y-2">
			<svg
				className="animate-spin mx-auto h-5 w-5 text-primary-700"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
			<p>We&#39;re finalizing your cloud phone initialization.</p>
			<p>
				You don&#39;t have to refresh this page, we will do it automatically for you when your phone is ready.
			</p>
		</div>
	);
}
