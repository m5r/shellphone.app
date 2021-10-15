import styles from "./testimonials.module.css";

export default function Testimonials() {
	return (
		<div className="bg-rebeccapurple-600">
			<div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
				<p className="text-xl text-white text-center text-base font-semibold uppercase text-gray-600 tracking-wider">
					Trusted by digital nomads in
					<div className="h-[2rem] relative flex">
						<span className={styles.location}>Bali</span>
						<span className={styles.location}>Tulum</span>
						<span className={styles.location}>Tbilissi</span>
						<span className={styles.location}>Bansko</span>
						<span className={styles.location}>Zanzibar</span>
						<span className={styles.location}>Mauritius</span>
						<span className={styles.location}>Amsterdam</span>
					</div>
				</p>
			</div>
		</div>
	);
}
