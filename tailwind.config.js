const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
	mode: "jit",
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter var", ...defaultTheme.fontFamily.sans],
			},
			gridTemplateColumns: {
				"sidebar-content": "1.5rem 1fr",
			},
			colors: {
				primary: {
					"50": "#f9fafb",
					"100": "#eef1fb",
					"200": "#dbd7f8",
					"300": "#bcb1ed",
					"400": "#a286df",
					"500": "#8861d3",
					"600": "#7045be",
					"700": "#663399",
					"800": "#39236b",
					"900": "#1f163f",
				},
			},
		},
	},
	variants: {},
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
	],
	purge: [
		"./src/components/**/*.{js,ts,jsx,tsx}",
		"./src/pages/**/*.{js,ts,jsx,tsx}",
	],
};
