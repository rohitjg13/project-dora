// Pinned to adapter-vercel rather than adapter-auto: the OG card route ships a Wasm renderer, and
// the Node serverless bundle it needs is the one thing that must not be guessed at build time.
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};

export default config;
