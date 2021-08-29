import mockupImage from "../images/mockup-image-01.png";
import iphoneMockup from "../images/iphone-mockup.png";

export default function PhoneMockup() {
	return (
		<div className="md:col-span-5 lg:col-span-5 text-center md:text-right">
			<div className="inline-flex relative justify-center items-center">
				<img
					className="absolute max-w-[84.33%]"
					src={mockupImage.src}
					width={290}
					height={624}
					alt="Features illustration"
				/>
				<img
					className="relative max-w-full mx-auto md:mr-0 md:max-w-none h-auto pointer-events-none"
					src={iphoneMockup.src}
					width={344}
					height={674}
					alt="iPhone mockup"
					aria-hidden="true"
				/>
			</div>
		</div>
	);
}
