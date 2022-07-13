import { Form, useActionData } from "@remix-run/react";

import type { JoinWaitlistActionData } from "~/features/public-area/actions";
import Button from "./button";
import Container from "./container";
import { TextField } from "./fields";

import Alert from "~/features/core/components/alert";

import backgroundImage from "../images/background-call-to-action.jpg";

export default function CallToAction() {
	const actionData = useActionData<JoinWaitlistActionData>();

	return (
		<section id="get-started-today" className="relative overflow-hidden bg-blue-600 py-32">
			<img
				className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
				src={backgroundImage}
				alt=""
				width={2347}
				height={1244}
			/>
			<Container className="relative">
				<div className="mx-auto max-w-lg text-center">
					<h2 className="font-mackinac font-bold text-3xl tracking-tight text-white sm:text-4xl">
						Request access
					</h2>
					<p className="mt-4 text-lg tracking-tight text-white">
						Shellphone is currently invite-only but we onboard new users on a regular basis. Enter your
						email address to join the waitlist and receive important updates in your inbox.
					</p>
				</div>

				<Form
					method="post"
					className="max-w-2xl mx-auto flex flex-col space-y-4 items-center mt-10 sm:flex-row sm:space-y-0 sm:space-x-4"
				>
					{actionData?.submitted ? (
						<div className="m-auto">
							<Alert
								title="You made it!"
								message="You&#39;re on the list, we will be in touch soon"
								variant="success"
							/>
						</div>
					) : (
						<>
							<TextField
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								className="w-full"
								placeholder="Enter your email address"
								required
							/>
							<Button type="submit" variant="solid" color="white" className="w-40">
								<span>Join waitlist</span>
							</Button>
						</>
					)}
				</Form>
			</Container>
		</section>
	);
}
