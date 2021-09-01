import { useMutation } from "blitz";
import { useForm } from "react-hook-form";
import * as Panelbear from "@panelbear/panelbear-js";

import joinWaitlist from "../mutations/join-waitlist";

type Form = {
	email: string;
};

export default function CTAForm() {
	const [joinWaitlistMutation] = useMutation(joinWaitlist);
	const {
		handleSubmit,
		register,
		formState: { isSubmitted },
	} = useForm<Form>();
	const onSubmit = handleSubmit(async ({ email }) => {
		if (isSubmitted) {
			return;
		}

		Panelbear.track("join-waitlist");
		return joinWaitlistMutation({ email });
	});

	return (
		<form onSubmit={onSubmit}>
			{isSubmitted ? (
				<p className="text-center md:text-left mt-2 opacity-75 text-green-900 text-md">
					You&#39;re on the list! We will be in touch soon
				</p>
			) : (
				<div className="flex flex-col sm:flex-row justify-center w-full md:max-w-md md:mx-0">
					<input
						{...register("email")}
						type="email"
						className="form-input w-full mb-2 sm:mb-0 sm:mr-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
						placeholder="Enter your email address"
					/>
					<button type="submit" className="btn text-white bg-primary-500 hover:bg-primary-400 flex-shrink-0">
						Request access
					</button>
				</div>
			)}
		</form>
	);
}
