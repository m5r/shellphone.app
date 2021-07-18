import type { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { useForm } from "react-hook-form";

import Logo from "../components/logo";

const Index: NextPage = () => {
	return (
		<section className="bg-white">
			<Hero />
			<Features />
			<Newsletter />
			<Footer />
		</section>
	);
};

function Hero() {
	return (
		<section className="bg-primary-700 bg-opacity-5">
			<header className="max-w-screen-lg mx-auto px-3 py-6">
				<div className="flex flex-wrap justify-between items-center">
					<Link href="/">
						<a>
							<Logo className="h-8 w-8" />
						</a>
					</Link>

					<nav className="flex items-center justify-end flex-1 w-0">
						<Link href="/auth/sign-in">
							<a className="whitespace-nowrap text-base font-medium text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out">
								Sign in
							</a>
						</Link>
						<Link href="/auth/sign-up">
							<a className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition duration-150 ease-in-out">
								Sign up
							</a>
						</Link>
					</nav>
				</div>
			</header>

			<main className="max-w-screen-lg mx-auto px-3 pt-16 pb-24 text-center">
				<h2 className="text-5xl tracking-tight font-extrabold text-gray-900">
					Welcome to your
					<br />
					<span className="text-primary-600">serverless</span> web app
				</h2>
				<p className="mt-3 text-lg text-gray-800 sm:mt-5  sm:max-w-xl sm:mx-auto">
					Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure
					qui lorem cupidatat commodo. Elit sunt amet fugiat veniam
					occaecat fugiat aliqua.
				</p>

				<div className="mt-12 space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:flex-row-reverse sm:justify-center">
					<div className="rounded-md shadow">
						<Link href="/auth/sign-up">
							<a className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition duration-150 ease-in-out md:py-4 md:text-lg">
								Create an account
							</a>
						</Link>
					</div>
					<div>
						<Link href="/auth/sign-in">
							<a className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out md:py-4 md:text-lg">
								I&apos;m already a user
							</a>
						</Link>
					</div>
				</div>
			</main>
		</section>
	);
}

function Features() {
	return (
		<div className="py-20">
			<div className="max-w-screen-lg mx-auto space-y-32 px-3">
				<div className="text-center">
					<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
						A better way to bootstrap your app
					</h3>
					<p className="mt-4 max-w-2xl text-lg leading-7 text-gray-600 lg:mx-auto">
						Lorem ipsum dolor sit amet consect adipisicing elit.
						Possimus magnam voluptatum cupiditate veritatis in
						accusamus quisquam.
					</p>
				</div>

				<Feature
					title="Feature #1"
					description="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione."
					illustration="/static/illustrations/support-team.svg"
				/>

				<Feature
					title="Feature #2"
					description="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione."
					illustration="/static/illustrations/data-analytics.svg"
					isReversed
				/>

				<Feature
					title="Feature #3"
					description="Lorem ipsum, dolor sit amet consectetur adipisicing elit. Maiores impedit perferendis suscipit eaque, iste dolor cupiditate blanditiis ratione."
					illustration="/static/illustrations/learn-coding.svg"
				/>
			</div>
		</div>
	);
}

type FeatureProps = {
	title: string;
	description: string;
	illustration: string;
	isReversed?: true;
};

function Feature({
	title,
	description,
	illustration,
	isReversed,
}: FeatureProps) {
	return (
		<div
			className={clsx(
				"flex flex-col-reverse items-center justify-between",
				isReversed && "md:flex-row-reverse",
				!isReversed && "md:flex-row",
			)}
		>
			<div className="flex-1 text-center">
				<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
					{title}
				</h3>
				<div className="mt-6 text-lg leading-9 text-gray-800">
					{description}
				</div>
			</div>

			<div className="relative w-96 h-60">
				<Image
					src={illustration}
					layout="fill"
					alt={`Feature ${title} illustration`}
				/>
			</div>
		</div>
	);
}

function Newsletter() {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { isSubmitted, isSubmitting },
	} = useForm<{ email: string }>();

	const onSubmit = handleSubmit(async ({ email }) => {
		try {
			const { default: axios } = await import("axios");
			await axios.post("/api/newsletter/subscribe", { email });
			setValue("email", "");
		} catch (error) {
			console.error(error);
		}
	});

	return (
		<div className="bg-primary-700 bg-opacity-5">
			<div className="max-w-screen-lg mx-auto px-3 py-16 xl:flex xl:items-center">
				<div className="xl:w-0 xl:flex-1">
					<h2 className="text-3xl font-extrabold tracking-tight">
						Want to know when we launch?
					</h2>
					<p className="mt-3 max-w-3xl text-lg leading-6 text-gray-600">
						Lorem ipsum, dolor sit amet.
					</p>
				</div>
				<div className="mt-8 sm:w-full sm:max-w-md xl:mt-0 xl:ml-8">
					{isSubmitting || isSubmitted ? (
						<span className="text-green-600">
							Thanks! We&apos;ll let you know when we launch
						</span>
					) : (
						<form onSubmit={onSubmit} className="sm:flex">
							<input
								id="email"
								type="email"
								autoComplete=""
								className="w-full border-gray-300 px-5 py-3 placeholder-gray-500 rounded-md"
								placeholder="Email address"
								{...register("email")}
								required
							/>
							<button
								type="submit"
								className="mt-3 w-full flex items-center justify-center px-5 py-3 border border-transparent shadow text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition duration-150 ease-in-out sm:mt-0 sm:ml-3 sm:w-auto sm:flex-shrink-0"
							>
								💌 Notify me
							</button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}

function Footer() {
	return (
		<div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
			<div className="flex justify-center md:order-2">
				<a
					href="https://twitter.com/m5r_m"
					className="ml-6 text-gray-500 hover:text-gray-600"
				>
					<span className="sr-only">Twitter</span>
					<svg
						className="h-6 w-6"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
					</svg>
				</a>
				<a
					href="https://github.com/m5r"
					className="ml-6 text-gray-500 hover:text-gray-600"
				>
					<span className="sr-only">GitHub</span>
					<svg
						className="h-6 w-6"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							fillRule="evenodd"
							d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
							clipRule="evenodd"
						/>
					</svg>
				</a>
			</div>
			<div className="mt-8 md:mt-0 md:order-1">
				<p className="text-center text-base leading-6 text-gray-600">
					&copy; 2021{" "}
					<a
						href="https://www.capsulecorp.dev"
						target="_blank"
						rel="noopener noreferrer"
					>
						Capsule Corp.
					</a>
				</p>
			</div>
		</div>
	);
}

export default Index;
