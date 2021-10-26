import fs from "fs";
import path from "path";
// @ts-ignore
import Maizzle from "@maizzle/framework";

export async function render(templateName: string, locals: Record<string, string> = {}) {
	const { template, options } = getMaizzleParams(templateName, locals);
	const { html } = await Maizzle.render(template, options);

	return html;
}

export async function plaintext(templateName: string, locals: Record<string, string> = {}) {
	const { template, options } = getMaizzleParams(templateName, locals);
	const { plaintext } = await Maizzle.plaintext(template, options);

	return plaintext;
}

function getMaizzleParams(templateName: string, locals: Record<string, string>) {
	const template = fs
		.readFileSync(path.resolve(process.cwd(), "./mailers/templates", `${templateName}.html`))
		.toString();
	const tailwindCss = fs.readFileSync(path.resolve(process.cwd(), "./mailers/tailwind.css")).toString();

	const options = {
		tailwind: {
			css: tailwindCss,
			config: {
				mode: "jit",
				theme: {
					screens: {
						sm: { max: "600px" },
						dark: { raw: "(prefers-color-scheme: dark)" },
					},
					extend: {
						colors: {
							gray: {
								"postmark-lightest": "#F4F4F7",
								"postmark-lighter": "#F2F4F6",
								"postmark-light": "#A8AAAF",
								"postmark-dark": "#51545E",
								"postmark-darker": "#333333",
								"postmark-darkest": "#222222",
								"postmark-meta": "#85878E",
							},
							blue: {
								postmark: "#3869D4",
							},
						},
						spacing: {
							screen: "100vw",
							full: "100%",
							px: "1px",
							0: "0",
							2: "2px",
							3: "3px",
							4: "4px",
							5: "5px",
							6: "6px",
							7: "7px",
							8: "8px",
							9: "9px",
							10: "10px",
							11: "11px",
							12: "12px",
							14: "14px",
							16: "16px",
							20: "20px",
							21: "21px",
							24: "24px",
							25: "25px",
							28: "28px",
							30: "30px",
							32: "32px",
							35: "35px",
							36: "36px",
							40: "40px",
							44: "44px",
							45: "45px",
							48: "48px",
							52: "52px",
							56: "56px",
							60: "60px",
							64: "64px",
							72: "72px",
							80: "80px",
							96: "96px",
							570: "570px",
							600: "600px",
							"1/2": "50%",
							"1/3": "33.333333%",
							"2/3": "66.666667%",
							"1/4": "25%",
							"2/4": "50%",
							"3/4": "75%",
							"1/5": "20%",
							"2/5": "40%",
							"3/5": "60%",
							"4/5": "80%",
							"1/6": "16.666667%",
							"2/6": "33.333333%",
							"3/6": "50%",
							"4/6": "66.666667%",
							"5/6": "83.333333%",
							"1/12": "8.333333%",
							"2/12": "16.666667%",
							"3/12": "25%",
							"4/12": "33.333333%",
							"5/12": "41.666667%",
							"6/12": "50%",
							"7/12": "58.333333%",
							"8/12": "66.666667%",
							"9/12": "75%",
							"10/12": "83.333333%",
							"11/12": "91.666667%",
						},
						borderRadius: {
							none: "0px",
							sm: "2px",
							DEFAULT: "4px",
							md: "6px",
							lg: "8px",
							xl: "12px",
							"2xl": "16px",
							"3xl": "24px",
							full: "9999px",
						},
						fontFamily: {
							sans: ['"Nunito Sans"', "-apple-system", '"Segoe UI"', "sans-serif"],
							serif: ["Constantia", "Georgia", "serif"],
							mono: ["Menlo", "Consolas", "monospace"],
						},
						fontSize: {
							0: "0",
							xxs: "12px",
							xs: "13px",
							sm: "14px",
							base: "16px",
							lg: "18px",
							xl: "20px",
							"2xl": "24px",
							"3xl": "30px",
							"4xl": "36px",
							"5xl": "48px",
							"6xl": "60px",
							"7xl": "72px",
							"8xl": "96px",
							"9xl": "128px",
						},
						inset: (theme: TailwindThemeHelper) => ({
							...theme("spacing"),
						}),
						letterSpacing: (theme: TailwindThemeHelper) => ({
							...theme("spacing"),
						}),
						lineHeight: (theme: TailwindThemeHelper) => ({
							...theme("spacing"),
						}),
						maxHeight: (theme: TailwindThemeHelper) => ({
							...theme("spacing"),
						}),
						maxWidth: (theme: TailwindThemeHelper) => ({
							...theme("spacing"),
							xs: "160px",
							sm: "192px",
							md: "224px",
							lg: "256px",
							xl: "288px",
							"2xl": "336px",
							"3xl": "384px",
							"4xl": "448px",
							"5xl": "512px",
							"6xl": "576px",
							"7xl": "640px",
						}),
						minHeight: (theme: TailwindThemeHelper) => ({
							...theme("spacing"),
						}),
						minWidth: (theme: TailwindThemeHelper) => ({
							...theme("spacing"),
						}),
					},
				},
				corePlugins: {
					animation: false,
					backgroundOpacity: false,
					borderOpacity: false,
					divideOpacity: false,
					placeholderOpacity: false,
					textOpacity: false,
				},
			},
		},
		maizzle: {
			build: {
				posthtml: {
					expressions: {
						locals,
					},
				},
			},
			company: {
				name: "Capsule Corp. Dev Pte. Ltd.",
				address: `
    <br>39 Robinson Rd, #11-01
    <br>Singapore 068911
    `,
				product: "Shellphone",
			},
			googleFonts: "family=Nunito+Sans:wght@400;700",
			year: () => new Date().getFullYear(),
			inlineCSS: true,
			prettify: true,
			removeUnusedCSS: true,
		},
	};

	return {
		template,
		options,
	};
}

type TailwindThemeHelper = (str: string) => {};
