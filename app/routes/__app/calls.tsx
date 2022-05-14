import { Suspense } from "react";
import { type PhoneCall, Prisma } from "@prisma/client";
import { type LoaderFunction, json } from "@remix-run/node";

import MissingTwilioCredentials from "~/features/core/components/missing-twilio-credentials";
import PageTitle from "~/features/core/components/page-title";
import Spinner from "~/features/core/components/spinner";
import InactiveSubscription from "~/features/core/components/inactive-subscription";
import PhoneCallsList from "~/features/phone-calls/components/phone-calls-list";
import { requireLoggedIn } from "~/utils/auth.server";
import db from "~/utils/db.server";
import { parsePhoneNumber } from "awesome-phonenumber";

type PhoneCallMeta = {
	formattedPhoneNumber: string;
	country: string | "unknown";
};

export type PhoneCallsLoaderData = { phoneCalls: (PhoneCall & { toMeta: PhoneCallMeta; fromMeta: PhoneCallMeta })[] };

export const loader: LoaderFunction = async ({ request }) => {
	const { organizations } = await requireLoggedIn(request);
	const organizationId = organizations[0].id;
	const phoneNumberId = "";
	const phoneNumber = await db.phoneNumber.findFirst({ where: { organizationId, id: phoneNumberId } });
	if (phoneNumber?.isFetchingCalls) {
		return;
	}

	const phoneCalls = await db.phoneCall.findMany({
		where: { phoneNumberId },
		orderBy: { createdAt: Prisma.SortOrder.desc },
	});

	return json<PhoneCallsLoaderData>({
		phoneCalls: phoneCalls.map((phoneCall) => ({
			...phoneCall,
			fromMeta: getPhoneNumberMeta(phoneCall.from),
			toMeta: getPhoneNumberMeta(phoneCall.to),
		})),
	});

	function getPhoneNumberMeta(rawPhoneNumber: string) {
		const countries: Record<string, string> = {
			AF: "Afghanistan",
			AL: "Albania",
			DZ: "Algeria",
			AS: "American Samoa",
			AD: "Andorra",
			AO: "Angola",
			AI: "Anguilla",
			AQ: "Antarctica",
			AG: "Antigua and Barbuda",
			AR: "Argentina",
			AM: "Armenia",
			AW: "Aruba",
			AU: "Australia",
			AT: "Austria",
			AZ: "Azerbaijan",
			BS: "Bahamas",
			BH: "Bahrain",
			BD: "Bangladesh",
			BB: "Barbados",
			BY: "Belarus",
			BE: "Belgium",
			BZ: "Belize",
			BJ: "Benin",
			BM: "Bermuda",
			BT: "Bhutan",
			BO: "Bolivia",
			BA: "Bosnia and Herzegovina",
			BW: "Botswana",
			BV: "Bouvet Island",
			BR: "Brazil",
			IO: "British Indian Ocean Territory",
			BN: "Brunei",
			BG: "Bulgaria",
			BF: "Burkina Faso",
			BI: "Burundi",
			KH: "Cambodia",
			CM: "Cameroon",
			CA: "Canada",
			CV: "Cape Verde",
			KY: "Cayman Islands",
			CF: "Central African Republic",
			TD: "Chad",
			CL: "Chile",
			CN: "China",
			CX: "Christmas Island",
			CC: "Cocos (Keeling) Islands",
			CO: "Colombia",
			KM: "Comoros",
			CG: "Congo",
			CD: "Congo, the Democratic Republic of the",
			CK: "Cook Islands",
			CR: "Costa Rica",
			CI: "Ivory Coast",
			HR: "Croatia",
			CU: "Cuba",
			CY: "Cyprus",
			CZ: "Czech Republic",
			DK: "Denmark",
			DJ: "Djibouti",
			DM: "Dominica",
			DO: "Dominican Republic",
			EC: "Ecuador",
			EG: "Egypt",
			SV: "El Salvador",
			GQ: "Equatorial Guinea",
			ER: "Eritrea",
			EE: "Estonia",
			ET: "Ethiopia",
			FK: "Falkland Islands (Malvinas)",
			FO: "Faroe Islands",
			FJ: "Fiji",
			FI: "Finland",
			FR: "France",
			GF: "French Guiana",
			PF: "French Polynesia",
			TF: "French Southern Territories",
			GA: "Gabon",
			GM: "Gambia",
			GE: "Georgia",
			DE: "Germany",
			GH: "Ghana",
			GI: "Gibraltar",
			GR: "Greece",
			GL: "Greenland",
			GD: "Grenada",
			GP: "Guadeloupe",
			GU: "Guam",
			GT: "Guatemala",
			GG: "Guernsey",
			GN: "Guinea",
			GW: "Guinea-Bissau",
			GY: "Guyana",
			HT: "Haiti",
			HM: "Heard Island and McDonald Islands",
			VA: "Holy See (Vatican City State)",
			HN: "Honduras",
			HK: "Hong Kong",
			HU: "Hungary",
			IS: "Iceland",
			IN: "India",
			ID: "Indonesia",
			IR: "Iran, Islamic Republic of",
			IQ: "Iraq",
			IE: "Ireland",
			IM: "Isle of Man",
			IL: "Israel",
			IT: "Italy",
			JM: "Jamaica",
			JP: "Japan",
			JE: "Jersey",
			JO: "Jordan",
			KZ: "Kazakhstan",
			KE: "Kenya",
			KI: "Kiribati",
			KP: "Korea, Democratic People's Republic of",
			KR: "South Korea",
			KW: "Kuwait",
			KG: "Kyrgyzstan",
			LA: "Lao People's Democratic Republic",
			LV: "Latvia",
			LB: "Lebanon",
			LS: "Lesotho",
			LR: "Liberia",
			LY: "Libya",
			LI: "Liechtenstein",
			LT: "Lithuania",
			LU: "Luxembourg",
			MO: "Macao",
			MK: "Macedonia, the former Yugoslav Republic of",
			MG: "Madagascar",
			MW: "Malawi",
			MY: "Malaysia",
			MV: "Maldives",
			ML: "Mali",
			MT: "Malta",
			MH: "Marshall Islands",
			MQ: "Martinique",
			MR: "Mauritania",
			MU: "Mauritius",
			YT: "Mayotte",
			MX: "Mexico",
			FM: "Micronesia, Federated States of",
			MD: "Moldova, Republic of",
			MC: "Monaco",
			MN: "Mongolia",
			ME: "Montenegro",
			MS: "Montserrat",
			MA: "Morocco",
			MZ: "Mozambique",
			MM: "Burma",
			NA: "Namibia",
			NR: "Nauru",
			NP: "Nepal",
			NL: "Netherlands",
			AN: "Netherlands Antilles",
			NC: "New Caledonia",
			NZ: "New Zealand",
			NI: "Nicaragua",
			NE: "Niger",
			NG: "Nigeria",
			NU: "Niue",
			NF: "Norfolk Island",
			MP: "Northern Mariana Islands",
			NO: "Norway",
			OM: "Oman",
			PK: "Pakistan",
			PW: "Palau",
			PS: "Palestinian Territory, Occupied",
			PA: "Panama",
			PG: "Papua New Guinea",
			PY: "Paraguay",
			PE: "Peru",
			PH: "Philippines",
			PN: "Pitcairn",
			PL: "Poland",
			PT: "Portugal",
			PR: "Puerto Rico",
			QA: "Qatar",
			RE: "Réunion",
			RO: "Romania",
			RU: "Russia",
			RW: "Rwanda",
			SH: "Saint Helena, Ascension and Tristan da Cunha",
			KN: "Saint Kitts and Nevis",
			LC: "Saint Lucia",
			PM: "Saint Pierre and Miquelon",
			VC: "St. Vincent and the Grenadines",
			WS: "Samoa",
			SM: "San Marino",
			ST: "Sao Tome and Principe",
			SA: "Saudi Arabia",
			SN: "Senegal",
			RS: "Serbia",
			SC: "Seychelles",
			SL: "Sierra Leone",
			SG: "Singapore",
			SK: "Slovakia",
			SI: "Slovenia",
			SB: "Solomon Islands",
			SO: "Somalia",
			ZA: "South Africa",
			GS: "South Georgia and the South Sandwich Islands",
			SS: "South Sudan",
			ES: "Spain",
			LK: "Sri Lanka",
			SD: "Sudan",
			SR: "Suriname",
			SJ: "Svalbard and Jan Mayen",
			SZ: "Swaziland",
			SE: "Sweden",
			CH: "Switzerland",
			SY: "Syrian Arab Republic",
			TW: "Taiwan",
			TJ: "Tajikistan",
			TZ: "Tanzania, United Republic of",
			TH: "Thailand",
			TL: "Timor-Leste",
			TG: "Togo",
			TK: "Tokelau",
			TO: "Tonga",
			TT: "Trinidad and Tobago",
			TN: "Tunisia",
			TR: "Turkey",
			TM: "Turkmenistan",
			TC: "Turks and Caicos Islands",
			TV: "Tuvalu",
			UG: "Uganda",
			UA: "Ukraine",
			AE: "United Arab Emirates",
			GB: "United Kingdom",
			US: "United States",
			UM: "United States Minor Outlying Islands",
			UY: "Uruguay",
			UZ: "Uzbekistan",
			VU: "Vanuatu",
			VE: "Venezuela",
			VN: "Vietnam",
			VG: "Virgin Islands, British",
			VI: "Virgin Islands, U.S.",
			WF: "Wallis and Futuna",
			EH: "Western Sahara",
			YE: "Yemen",
			ZM: "Zambia",
			ZW: "Zimbabwe",
		};
		const phoneNumber = parsePhoneNumber(rawPhoneNumber);
		const formattedPhoneNumber =
			phoneNumber.getNumber("international") ?? phoneNumber.getNumber("national") ?? rawPhoneNumber;

		return {
			formattedPhoneNumber,
			country: countries[phoneNumber.getRegionCode()] ?? "unknown",
		};
	}
};

export default function PhoneCalls() {
	const { hasFilledTwilioCredentials, hasPhoneNumber, hasOngoingSubscription } = {
		hasFilledTwilioCredentials: false,
		hasPhoneNumber: false,
		hasOngoingSubscription: false,
	};

	if (!hasFilledTwilioCredentials || !hasPhoneNumber) {
		return (
			<>
				<MissingTwilioCredentials />
				<PageTitle className="filter blur-sm select-none absolute top-0" title="Calls" />
			</>
		);
	}

	if (!hasOngoingSubscription) {
		return (
			<>
				<InactiveSubscription />
				<div className="filter blur-sm select-none absolute top-0 w-full h-full z-0">
					<PageTitle title="Calls" />
					<section className="relative flex flex-grow flex-col">
						<Suspense fallback={<Spinner />}>
							<PhoneCallsList />
						</Suspense>
					</section>
				</div>
			</>
		);
	}

	return (
		<>
			<PageTitle className="pl-12" title="Calls" />
			<section className="flex flex-grow flex-col">
				<Suspense fallback={<Spinner />}>
					{/* TODO: skeleton phone calls list */}
					<PhoneCallsList />
				</Suspense>
			</section>
		</>
	);
}
