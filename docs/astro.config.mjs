import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://sunshine-themes.github.io',
	base: '/intersectionTrigger/',
	integrations: [
		sitemap(),
		starlight({
			title: 'IntersectionTrigger',
			logo: {
				src: './src/assets/logo.svg',
				replacesTitle: false,
			},
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{
					label: 'Getting Started',
					collapsed: false,
					items: [
						{ slug: 'getting-started/installation' },
						{ slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'Guide',
					collapsed: false,
					items: [
						{ slug: 'guide/core-concepts' },
						{ slug: 'guide/constructor' },
						{ slug: 'guide/methods' },
						{ slug: 'guide/callbacks' },
						{ slug: 'guide/custom-roots' },
					],
				},
				{
					label: 'API Reference',
					collapsed: false,
					items: [
						{ slug: 'api/intersectiontrigger-class' },
						{ slug: 'api/trigger-options' },
						{ slug: 'api/static-methods' },
						{ slug: 'api/type-definitions' },
					],
				},
				{
					label: 'Plugins',
					collapsed: false,
					items: [
						{ slug: 'plugins/overview' },
						{ slug: 'plugins/animation' },
						{ slug: 'plugins/toggleclass' },
						{ slug: 'plugins/guides-plugin' },
					],
				},
				{
					label: 'Examples',
					collapsed: false,
					items: [
						{ slug: 'examples/basic-trigger' },
						{ slug: 'examples/controlled-animation' },
						{ slug: 'examples/linked-animation' },
						{ slug: 'examples/snapping' },
						{ slug: 'examples/toggleclass-examples' },
						{ slug: 'examples/lazy-loading' },
						{ slug: 'examples/infinite-scroll' },
					],
				},
				{ slug: 'changelog' },
			],
			tableOfContents: {
				minHeadingLevel: 2,
				maxHeadingLevel: 4,
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/sunshine-themes/intersectionTrigger' },
			],
		}),
		react(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
