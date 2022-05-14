import { useState } from "react";

export default function CTAForm() {
	const [{ isSubmitted }, setState] = useState({ isSubmitted: false });
	const onSubmit = () => setState({ isSubmitted: true });

	return (
		<form onSubmit={onSubmit}>
			{isSubmitted ? (
				<p className="text-center md:text-left mt-2 opacity-75 text-green-900 text-md">
					You&#39;re on the list! We will be in touch soon
				</p>
			) : (
				<div className="flex flex-col sm:flex-row justify-center w-full md:max-w-md md:mx-0">
					<input
						name="email"
						type="email"
						className="form-input w-full mb-2 sm:mb-0 sm:mr-2 focus:outline-none focus:ring-rebeccapurple-500 focus:border-rebeccapurple-500"
						placeholder="Enter your email address"
					/>
					<button
						type="submit"
						className="btn text-white bg-rebeccapurple-500 hover:bg-rebeccapurple-400 flex-shrink-0"
					>
						Request access
					</button>
				</div>
			)}
		</form>
	);
}
