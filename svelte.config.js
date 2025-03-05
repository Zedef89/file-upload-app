import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			$lib: 'src/lib' // ✅ Aggiunto alias per importare $lib
		},
		files: {
			assets: 'static'
		  },
		paths: {
			assets: '',
			base: ''
		}
	}
};

export default config;