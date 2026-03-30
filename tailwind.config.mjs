/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			fontSize: {
				base: '16px',
			},
			colors: {
				surface: {
					DEFAULT: '#FAFAFA',
					dark: '#141414',
				},
				primary: {
					DEFAULT: '#1A1A1A',
					dark: '#EDEDEC',
				},
				secondary: {
					DEFAULT: '#6B6B6B',
					dark: '#9A9A9A',
				},
				muted: {
					DEFAULT: '#A1A1A1',
					dark: '#5A5A5A',
				},
				border: {
					DEFAULT: '#E8E8E4',
					dark: '#2A2A2A',
				},
			},
		},
	},
	plugins: [
    require("@tailwindcss/typography"),
    require('@tailwindcss/forms'),
  ],
};
