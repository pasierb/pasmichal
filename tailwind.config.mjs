/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			fontFamily: {
				serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
				sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
			},
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
					DEFAULT: '#737373',
					dark: '#8A8A8A',
				},
				border: {
					DEFAULT: '#E8E8E4',
					dark: '#2A2A2A',
				},
				accent: {
					DEFAULT: '#F4C2C8',
					dark: '#6B3942',
				},
			},
		},
	},
	plugins: [
    require("@tailwindcss/typography"),
    require('@tailwindcss/forms'),
  ],
};
