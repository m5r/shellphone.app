import Header from "../components/header";
import Hero from "../components/hero";
import CallToAction from "../components/call-to-action";
import Faqs from "../components/faqs";

export default function IndexPage() {
	return (
		<section className="flex h-full flex-col">
			<Header />
			<main>
				<Hero />
				<CallToAction />
				<Faqs />
			</main>
		</section>
	);
}
